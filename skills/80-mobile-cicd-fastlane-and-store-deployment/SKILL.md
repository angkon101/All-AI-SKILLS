---
name: Mobile CI/CD, Fastlane Automation, and Store Deployment
description: Automated mobile release pipelines with Fastlane, iOS code signing with Match, Android Play App Signing, TestFlight and Google Play track deployments, OTA updates, and store compliance.
version: 1.0.0
category: mobile-engineering
tags:
  - mobile-cicd
  - fastlane
  - code-signing
  - testflight
  - google-play
  - ota-updates
  - privacy-manifests
  - app-store-deployment
---

# Mobile CI/CD, Fastlane Automation, and Store Deployment

Modern mobile engineering requires fully automated, repeatable build and deployment pipelines. Managing code signing identities across distributed development teams, compiling reproducible Android App Bundles (.aab) and iOS Archive (.ipa) artifacts, and automating compliance submissions are essential to avoid broken releases and store rejections.

---

## 1. Enterprise Release Architecture Topography

```
┌─────────────────────────────────────────────────────────────┐
│ Developer Commit / Tag: v2.4.0 (Build 142)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ GitHub Actions / GitLab CI Runner
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ CI Pipeline Build Stage                                     │
│  - Static Analysis, Linting & Unit/UI Tests                 │
│  - iOS: Fastlane Match pulls encrypted certs/profiles       │
│  - Android: Decrypts production release upload keystore     │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ iOS Fastlane Lane: release  │ │ Android Lane: release       │
│  - gym (xcodebuild archive) │ │  - gradle(task: bundle)     │
│  - Deliver to TestFlight    │ │  - upload_to_play_store     │
│  - Submit App Store Review  │ │    (Internal / Production)  │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Fastlane Match Code Signing Setup

Fastlane `match` manages iOS signing certificates and provisioning profiles securely inside a private Git repository or AWS S3 bucket encrypted with OpenSSL AES-256.

### `ios/fastlane/Matchfile`
```ruby
git_url("git@github.com:enterprise/certificates.git")
storage_mode("git")
type("appstore") # Options: appstore, adhoc, development, enterprise
app_identifier(["com.enterprise.readerapp", "com.enterprise.readerapp.NotificationService"])
username("developer@yourdomain.com")
team_id("ABC123XYZ")
```

---

## 3. Production Fastlane Pipeline Configuration

Save to: `fastlane/Fastfile`

```ruby
default_platform(:ios)

platform :ios do
  desc "Run unit tests and UI tests"
  lane :test do
    run_tests(
      workspace: "ios/ReaderApp.xcworkspace",
      scheme: "ReaderApp",
      devices: ["iPhone 15 Pro"]
    )
  end

  desc "Build and upload release candidate to Apple TestFlight"
  lane :beta do
    ensure_git_status_clean
    increment_build_number(
      build_number: ENV["GITHUB_RUN_NUMBER"] || (get_build_number.to_i + 1).to_s,
      xcodeproj: "ios/ReaderApp.xcodeproj"
    )

    match(type: "appstore", readonly: is_ci)

    build_app(
      workspace: "ios/ReaderApp.xcworkspace",
      scheme: "ReaderApp",
      export_method: "app-store",
      output_directory: "./build/ios",
      output_name: "ReaderApp.ipa"
    )

    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      distribute_external: false
    )
  end

  desc "Promote build to production on App Store Connect"
  lane :release do
    beta
    deliver(
      force: true,
      skip_metadata: false,
      skip_screenshots: true,
      submit_for_review: true,
      automatic_release: true,
      phased_release: true # 7-day staged rollout to production
    )
  end
end

platform :android do
  desc "Run Android Lint and Unit Tests"
  lane :test do
    gradle(
      task: "testReleaseUnitTest",
      project_dir: "./android"
    )
  end

  desc "Build AAB and deploy to Google Play Internal Test Track"
  lane :beta do
    gradle(
      task: "bundle",
      build_type: "Release",
      project_dir: "./android"
    )

    upload_to_play_store(
      track: "internal",
      package_name: "com.enterprise.readerapp",
      aab: "android/app/build/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Promote Internal build to Google Play Production Track"
  lane :release do
    upload_to_play_store(
      track: "production",
      track_promote_to: "production",
      package_name: "com.enterprise.readerapp",
      rollout: "0.1", # 10% Staged Rollout
      skip_upload_metadata: false
    )
  end
end
```

---

## 4. GitHub Actions Automated Matrix Workflow
Save to: `.github/workflows/mobile-release.yml`

```yaml
name: Mobile Release Pipeline

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Ruby & Fastlane
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Decode Android Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > android/app/release.keystore
        env:
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}

      - name: Build and Upload Android AAB to Play Store
        run: bundle exec fastlane android beta
        env:
          SUPPLY_JSON_KEY_DATA: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
          ANDROID_KEYSTORE_PASS: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}

  build-ios:
    runs-on: macos-14
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Select Xcode 15.4
        run: sudo xcode-select -s /Applications/Xcode_15.4.app

      - name: Set up Ruby & Fastlane
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Fastlane Match & Build iOS IPA
        run: bundle exec fastlane ios beta
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_ENCRYPTION_PASSWORD }}
          MATCH_GIT_PRIVATE_KEY: ${{ secrets.MATCH_SSH_KEY }}
          APP_STORE_CONNECT_API_KEY_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          APP_STORE_CONNECT_API_KEY_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY_KEY: ${{ secrets.ASC_PRIVATE_KEY }}
```

---

## 5. Apple Privacy Manifest (`PrivacyInfo.xcprivacy`)

Mandatory for all iOS apps and SDKs submitted to the App Store.

Save to: `ios/ReaderApp/PrivacyInfo.xcprivacy`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeUserID</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPITypeUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

---

## 6. Verification Checklist

- [ ] Phased Rollouts: Always enforce 7-day phased rollout on App Store and staged percentage (10% -> 25% -> 50% -> 100%) on Google Play.
- [ ] Fastlane Match Readonly: Verify CI pipelines run `match(..., readonly: true)` to avoid accidental certificate revoking.
- [ ] Android App Signing: Use Google Play App Signing with separate upload key.
- [ ] Store Compliance: Validate required Account Deletion flow in Settings and In-App Purchase restore mechanisms.
- [ ] Privacy Manifest: Audit bundled third-party libraries for missing `PrivacyInfo.xcprivacy` declarations before App Store submission.
