---
name: Mobile Security and Tamper Resistance
description: Production-grade mobile application hardening, Root and Jailbreak detection, Play Integrity attestation, SSL public key pinning, Secure Enclave / KeyStore cryptographic isolation, and anti-reversing defenses.
version: 1.0.0
category: mobile-engineering
tags:
  - mobile-security
  - android-security
  - ios-security
  - root-detection
  - jailbreak-detection
  - play-integrity
  - certificate-pinning
  - secure-enclave
---

# Mobile Security and Tamper Resistance

Mobile applications run in untrusted zero-trust client environments. Reverse engineers and attackers routinely employ tools like Frida, Ghidra, Frida-gadget, and MITM proxies to inspect payloads, tamper with in-memory execution, and bypass licensing or authentication checks.

---

## 1. Enterprise Mobile Defense Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Application Launch Gate                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Integrity Check: Root / Jailbreak / Debugger Detection              │
│ 2. Remote Attestation: Google Play Integrity / Apple App Attest         │
│ 3. Storage Security: StrongBox Keystore / Secure Enclave Hardware      │
│ 4. Transport Security: Public Key Hash Pinning (HPKP)                  │
│ 5. UX Protection: Android FLAG_SECURE / iOS Snapshot Obfuscation       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SSL/TLS Public Key Pinning

Certificate pinning protects against compromised CA authorities and rogue enterprise inspection proxies.

### A. Android Network Security Configuration
Save to: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Production Pinning: Enforce SHA-256 Public Key Pinning -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yourdomain.com</domain>
        <pin-set expiration="2027-12-31">
            <!-- Primary Leaf/Intermediate Cert Public Key Hash -->
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <!-- Backup Certificate Authority Public Key Hash -->
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

Apply to `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

### B. iOS URLSession Public Key Pinning Delegate
Save to: `ios/App/Security/PinnedURLSessionDelegate.swift`

```swift
import Foundation
import CryptoKit

final class PinnedURLSessionDelegate: NSObject, URLSessionDelegate {
    // Array of accepted base64-encoded SHA-256 public key hashes
    private let pinnedHashes: Set<String> = [
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
    ]

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Validate certificate chain integrity
        var secError: CFError?
        let isTrusted = SecTrustEvaluateWithError(serverTrust, &secError)
        guard isTrusted, secError == nil else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Extract public keys from certificate chain and match hash
        let count = SecTrustGetCertificateCount(serverTrust)
        for index in 0..<count {
            if let cert = SecTrustGetCertificateAtIndex(serverTrust, index),
               let publicKey = SecCertificateCopyKey(cert),
               let keyData = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? {
                
                let hash = SHA256.hash(data: keyData)
                let base64Hash = Data(hash).base64EncodedString()

                if pinnedHashes.contains(base64Hash) {
                    completionHandler(.useCredential, URLCredential(trust: serverTrust))
                    return
                }
            }
        }

        // No matching public key found in chain
        completionHandler(.cancelAuthenticationChallenge, nil)
    }
}
```

---

## 3. Jailbreak & Root Detection Engine

### A. iOS Multi-Vector Jailbreak Validator
Save to: `ios/App/Security/JailbreakDetector.swift`

```swift
import Foundation
import UIKit

struct JailbreakDetector {
    static func isDeviceCompromised() -> Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        return checkSuspiciousPaths() ||
               checkSuspiciousSchemes() ||
               checkWritableSystemPaths() ||
               checkForkInjection()
        #endif
    }

    private static func checkSuspiciousPaths() -> Bool {
        let suspiciousPaths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt",
            "/usr/bin/ssh",
            "/private/var/lib/apt"
        ]
        return suspiciousPaths.contains { FileManager.default.fileExists(atPath: $0) }
    }

    private static func checkSuspiciousSchemes() -> Bool {
        let schemes = ["cydia://", "sileo://", "undecimus://", "zbra://"]
        return schemes.contains { scheme in
            if let url = URL(string: scheme) {
                return UIApplication.shared.canOpenURL(url)
            }
            return false
        }
    }

    private static func checkWritableSystemPaths() -> Bool {
        let testPath = "/private/jailbreak_test_\(UUID().uuidString).txt"
        do {
            try "probe".write(toFile: testPath, atomically: true, encoding: .utf8)
            try? FileManager.default.removeItem(atPath: testPath)
            return true // Successfully wrote outside sandbox! Device is jailbroken.
        } catch {
            return false
        }
    }

    private static func checkForkInjection() -> Bool {
        let pid = fork()
        if pid >= 0 {
            if pid > 0 {
                // Parent kills child
                kill(pid, SIGTERM)
            }
            return true // Sandbox escape allows fork
        }
        return false
    }
}
```

---

### B. Android Native Root & Magisk Detection
Save to: `android/app/src/main/kotlin/com/enterprise/app/security/RootDetector.kt`

```kotlin
package com.enterprise.app.security

import android.os.Build
import java.io.File

object RootDetector {

    fun isDeviceRooted(): Boolean {
        return checkRootBinaries() ||
               checkTestKeys() ||
               checkSuCommand() ||
               checkMagiskMounts()
    }

    private fun checkRootBinaries(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        )
        return paths.any { File(it).exists() }
    }

    private fun checkTestKeys(): Boolean {
        val buildTags = Build.TAGS
        return buildTags != null && buildTags.contains("test-keys")
    }

    private fun checkSuCommand(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            val exitCode = process.waitFor()
            exitCode == 0
        } catch (e: Exception) {
            false
        }
    }

    private fun checkMagiskMounts(): Boolean {
        return try {
            File("/proc/mounts").readLines().any { line ->
                line.contains("magisk") || line.contains("core/mirror")
            }
        } catch (e: Exception) {
            false
        }
    }
}
```

---

## 4. Hardware Cryptography (Hardware Keystore & Secure Enclave)

### Android StrongBox Key Generation
```kotlin
package com.enterprise.app.security

import android.content.Context
import android.content.pm.PackageManager
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

object HardwareCryptoManager {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "enterprise_master_key"

    fun getOrCreateMasterKey(context: Context): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        if (keyStore.containsAlias(KEY_ALIAS)) {
            val entry = keyStore.getEntry(KEY_ALIAS, null) as KeyStore.SecretKeyEntry
            return entry.secretKey
        }

        val hasStrongBox = context.packageManager.hasSystemFeature(PackageManager.FEATURE_STRONGBOX_KEYSTORE)

        val builder = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .setUserAuthenticationRequired(false)

        if (hasStrongBox) {
            builder.setIsStrongBoxBacked(true)
        }

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        keyGenerator.init(builder.build())
        return keyGenerator.generateKey()
    }
}
```

---

## 5. R8/ProGuard Anti-Tamper Configuration
Save to: `android/app/proguard-rules.pro`

```proguard
# Strip all logging and assertion bytecode
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}

# Repackage all classes into a single flat obfuscated package
-repackageclasses 'com.enterprise.app.obf'
-allowaccessmodification

# Obfuscate dictionary mapping
-classobfuscationdictionary dictionary.txt
-packageobfuscationdictionary dictionary.txt
-obfuscationdictionary dictionary.txt

# Preserve JNI bridges while obfuscating internals
-keepclasseswithmembernames class * {
    native <methods>;
}
```

---

## 6. Verification Checklist

- [ ] Play Integrity API: Implement cloud server-side verification using Google Cloud Play Integrity API client.
- [ ] Certificate Expiry: Ensure backup SHA-256 public key hash pins prevent outage during CA renewal.
- [ ] Screen Privacy: Apply `FLAG_SECURE` in Android `Activity.onCreate` and blur overlay in iOS `sceneWillResignActive`.
- [ ] Emulators & Debuggers: Block runtime execution when `android.os.Debug.isDebuggerConnected()` is detected.
