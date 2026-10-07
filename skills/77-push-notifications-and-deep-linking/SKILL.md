---
name: Push Notifications and Deep Linking Architecture
description: Enterprise mobile push notification pipelines (APNs, FCM v1), background payload decryptors, iOS Universal Links, Android App Links, and deferred deep linking routers.
version: 1.0.0
category: mobile-engineering
tags:
  - push-notifications
  - apns
  - fcm
  - universal-links
  - app-links
  - deep-linking
  - android
  - ios
---

# Push Notifications and Deep Linking Architecture

Enterprise mobile applications require resilient delivery of push notifications, payload-level security (end-to-end encryption before display), and deep link routing that transitions users from web campaigns, emails, or SMS directly into authenticated, parameterized app screens.

---

## 1. Unified Push and Deep Linking Topography

```
                    ┌────────────────────────────┐
                    │ Web / Email / SMS Campaign │
                    └─────────────┬──────────────┘
                                  │
                  ┌───────────────┴──────────────┐
                  │ Universal Links / App Links   │
                  └───────────────┬──────────────┘
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │               Deep Link Router Engine                  │
      │  - Route matcher: /books/:id/chapter/:ch               │
      │  - Auth gate: Stashes pending route if unauthenticated │
      │  - Deferred resolver: Query attribution API on install │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Target Feature View / ViewModel                     │
└─────────────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ User taps notification banner
┌─────────────────────────────────┴───────────────────────────────────────┐
│                  Notification Service Extension                         │
│  - Intercepts raw APNs / FCM silent payload                             │
│  - Decrypts encrypted payload using KeyStore/Keychain AES-GCM key       │
│  - Downloads rich media attachment (cover image, preview)               │
│  - Displays local enriched notification with deep link action URI       │
└─────────────────────────────────▲───────────────────────────────────────┘
                                  │
                  ┌───────────────┴──────────────┐
                  │  APNs / FCM v1 Provider Push  │
                  └──────────────────────────────┘
```

---

## 2. Server-to-Client Remote Push Implementations

### A. iOS Notification Service Extension (Payload Decryption & Rich Attachments)
Save to: `ios/NotificationService/NotificationService.swift`

```swift
import UserNotifications
import CryptoKit

final class NotificationService: UNNotificationServiceExtension {
    private var contentHandler: ((UNNotificationContent) -> Void)?
    private var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        guard let bestAttemptContent = bestAttemptContent else { return }

        let userInfo = request.content.userInfo

        // 1. Decrypt end-to-end encrypted push payload if present
        if let encryptedPayload = userInfo["enc_payload"] as? String,
           let ivString = userInfo["iv"] as? String,
           let sharedKey = getDecryptionKeyFromSharedKeychain() {
            
            if let decryptedText = decryptPayload(cipherTextBase64: encryptedPayload, ivBase64: ivString, key: sharedKey) {
                bestAttemptContent.body = decryptedText
            }
        }

        // 2. Download and attach media if media_url is provided
        if let mediaUrlString = userInfo["media_url"] as? String,
           let mediaUrl = URL(string: mediaUrlString) {
            
            downloadAttachment(for: mediaUrl) { attachment in
                if let attachment = attachment {
                    bestAttemptContent.attachments = [attachment]
                }
                contentHandler(bestAttemptContent)
            }
        } else {
            contentHandler(bestAttemptContent)
        }
    }

    override func serviceExtensionTimeWillExpire() {
        // Fallback if network or decryption exceeds 30-second OS limit
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            bestAttemptContent.title = "New Notification"
            bestAttemptContent.body = "Open the app to read your secure message."
            contentHandler(bestAttemptContent)
        }
    }

    private func decryptPayload(cipherTextBase64: String, ivBase64: String, key: SymmetricKey) -> String? {
        guard let cipherData = Data(base64Encoded: cipherTextBase64),
              let ivData = Data(base64Encoded: ivBase64) else { return nil }
        do {
            let nonce = try AES.GCM.Nonce(data: ivData)
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: cipherData.dropLast(16), tag: cipherData.suffix(16))
            let decryptedData = try AES.GCM.open(sealedBox, using: key)
            return String(data: decryptedData, encoding: .utf8)
        } catch {
            return nil
        }
    }

    private func downloadAttachment(for url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        URLSession.shared.downloadTask(with: url) { temporaryUrl, _, error in
            guard let temporaryUrl = temporaryUrl, error == nil else {
                completion(nil)
                return
            }
            let fileManager = FileManager.default
            let targetUrl = temporaryUrl.appendingPathExtension("jpg")
            do {
                try fileManager.moveItem(at: temporaryUrl, to: targetUrl)
                let attachment = try UNNotificationAttachment(identifier: "media_thumb", url: targetUrl, options: nil)
                completion(attachment)
            } catch {
                completion(nil)
            }
        }.resume()
    }

    private func getDecryptionKeyFromSharedKeychain() -> SymmetricKey? {
        // Shared App Group Keychain query
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "push_encryption_key",
            kSecAttrAccessGroup as String: "group.com.enterprise.app",
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        if SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
           let data = item as? Data {
            return SymmetricKey(data: data)
        }
        return nil
    }
}
```

---

### B. Android FirebaseMessagingService Implementation
Save to: `android/app/src/main/kotlin/com/enterprise/app/service/AppFirebaseMessagingService.kt`

```kotlin
package com.enterprise.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AppFirebaseMessagingService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        serviceScope.launch {
            // Register token with backend server
            uploadPushTokenToBackend(token)
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val data = remoteMessage.data
        val title = data["title"] ?: remoteMessage.notification?.title ?: "Notification"
        val body = data["body"] ?: remoteMessage.notification?.body ?: ""
        val deepLinkUri = data["deep_link"] ?: "app://home"
        val channelId = data["channel_id"] ?: CHANNEL_DEFAULT

        createNotificationChannel(channelId)
        showNotification(title, body, deepLinkUri, channelId)
    }

    private fun showNotification(title: String, body: String, deepLink: String, channelId: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify((0..100000).random(), notification)
    }

    private fun createNotificationChannel(channelId: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (manager.getNotificationChannel(channelId) == null) {
                val channel = NotificationChannel(
                    channelId,
                    "General Notifications",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "High priority app alerts and updates"
                    enableVibration(true)
                }
                manager.createNotificationChannel(channel)
            }
        }
    }

    private suspend fun uploadPushTokenToBackend(token: String) {
        // POST to /api/v1/devices/token
    }

    companion object {
        const val CHANNEL_DEFAULT = "app_default_channel"
    }
}
```

---

## 3. Universal Links & App Links Verification Files

### A. Apple App Site Association (`apple-app-site-association`)
Host at: `https://app.yourdomain.com/.well-known/apple-app-site-association` with header `Content-Type: application/json` without extension.

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "ABC123XYZ.com.enterprise.readerapp",
        "paths": [
          "NOT /api/*",
          "NOT /auth/*",
          "/books/*",
          "/reader/*",
          "/author/*"
        ],
        "components": [
          {
            "/": "/books/*",
            "comment": "Match individual book detail pages"
          },
          {
            "/": "/reader/*",
            "?": { "cfi": "?*" },
            "comment": "Match reader deep link with CFI position parameter"
          }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["ABC123XYZ.com.enterprise.readerapp"]
  }
}
```

---

### B. Android Digital Asset Links (`assetlinks.json`)
Host at: `https://app.yourdomain.com/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.enterprise.readerapp",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7D:0F:52:CC:E5:43:7E:09:94:1B:39:70:1E:EA:72:12:85:00:2E:82:27:AE:A5:EB:48:9A:E4:A0:08"
      ]
    }
  }
]
```

Android Manifest Intent-Filter snippet:
```xml
<activity
    android:name=".MainActivity"
    android:exported="true">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="app.yourdomain.com"
            android:pathPrefix="/books" />
        <data
            android:scheme="https"
            android:host="app.yourdomain.com"
            android:pathPrefix="/reader" />
    </intent-filter>
</activity>
```

---

## 4. Production Deep Link Router (State & Auth Aware)

```typescript
// Shared DeepLinkRouter.ts
export type RouteDestination = 
  | { type: 'BOOK_DETAIL'; bookId: string }
  | { type: 'READER'; bookId: string; cfi?: string }
  | { type: 'PROFILE' }
  | { type: 'UNKNOWN'; rawUrl: string };

export class UniversalDeepLinkRouter {
  private static pendingRoute: RouteDestination | null = null;

  public static parseUrl(urlStr: string): RouteDestination {
    try {
      const url = new URL(urlStr);
      const segments = url.pathname.split('/').filter(Boolean);

      if (segments[0] === 'books' && segments[1]) {
        return { type: 'BOOK_DETAIL', bookId: segments[1] };
      }

      if (segments[0] === 'reader' && segments[1]) {
        const cfi = url.searchParams.get('cfi') || undefined;
        return { type: 'READER', bookId: segments[1], cfi };
      }

      if (segments[0] === 'profile') {
        return { type: 'PROFILE' };
      }

      return { type: 'UNKNOWN', rawUrl: urlStr };
    } catch {
      return { type: 'UNKNOWN', rawUrl: urlStr };
    }
  }

  public static route(
    destination: RouteDestination, 
    isAuthenticated: boolean, 
    navigator: (route: RouteDestination) => void
  ): void {
    if (!isAuthenticated && destination.type === 'READER') {
      // Gate reader access: stash route for post-login redirect
      this.pendingRoute = destination;
      navigator({ type: 'PROFILE' }); // Directs to login/auth view
      return;
    }

    navigator(destination);
  }

  public static consumePendingRoute(): RouteDestination | null {
    const route = this.pendingRoute;
    this.pendingRoute = null;
    return route;
  }
}
```

---

## 5. Verification Checklist

- [ ] Universal Links: Test via Apple `swcutil dl -d app.yourdomain.com` on physical iOS device.
- [ ] Android App Links: Verify verification status using `adb shell pm get-app-links com.enterprise.readerapp`.
- [ ] APNs Environment: Ensure Production certificates/tokens match release builds (`apns-push-type: alert`, `apns-priority: 10`).
- [ ] Push Background Delivery: Confirm `content-available: 1` silent pushes do not trigger rate limiting.
- [ ] Deferred Routing: Verify clipboard fallback attribution works seamlessly after install from Google Play / App Store.
