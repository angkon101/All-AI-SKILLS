const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'skills.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.version = '8.0.0';
data.description = 'Comprehensive suite of 80 production AI agent skills modeling an entire technology organization, Super Expert Full-Stack Developer, Principal Cybersecurity Architect, and Mobile Application Engineer: from executive strategy and full-stack type safety, to e-reader document engines, native Android/iOS, Flutter, offline sync, APNs/FCM push, OWASP API Top 10, and container hardening.';

const newTrack = {
  id: 'track-mobile-and-multiplatform',
  name: 'Track Q: Mobile, Native & Multi-Platform Application Engineering',
  skills: [
    '71-cross-platform-mobile-react-native-expo',
    '72-native-android-kotlin-and-jetpack-compose',
    '73-native-ios-swift-and-swiftui',
    '74-ereader-document-rendering-and-pagination',
    '75-flutter-and-multiplatform-dart',
    '76-mobile-offline-sync-and-sqlite-architecture',
    '77-push-notifications-and-deep-linking',
    '78-mobile-security-and-tamper-resistance',
    '79-mobile-performance-profiling-and-battery',
    '80-mobile-cicd-fastlane-and-store-deployment'
  ]
};

if (!data.tracks.some(t => t.id === newTrack.id)) {
  data.tracks.push(newTrack);
}

const newSkills = [
  {
    id: '71-cross-platform-mobile-react-native-expo',
    name: 'cross-platform-mobile-react-native-expo',
    path: 'skills/71-cross-platform-mobile-react-native-expo/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'React Native Fabric New Architecture, TurboModules C++ JSI, Expo Router v3 file-based navigation, Reanimated 3 worklets, and 120 FPS gesture handling.'
  },
  {
    id: '72-native-android-kotlin-and-jetpack-compose',
    name: 'native-android-kotlin-and-jetpack-compose',
    path: 'skills/72-native-android-kotlin-and-jetpack-compose/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Modern Android development with Kotlin, Jetpack Compose, Material 3, Unidirectional Data Flow (MVI), Room Database, Coroutines/StateFlow, and WorkManager.'
  },
  {
    id: '73-native-ios-swift-and-swiftui',
    name: 'native-ios-swift-and-swiftui',
    path: 'skills/73-native-ios-swift-and-swiftui/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Production iOS engineering with Swift 6 structured concurrency, SwiftUI declarative view hierarchies, NavigationStack, AppStorage, and Keychain biometrics.'
  },
  {
    id: '74-ereader-document-rendering-and-pagination',
    name: 'ereader-document-rendering-and-pagination',
    path: 'skills/74-ereader-document-rendering-and-pagination/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'E-reader engines, EPUB3 and PDF rendering, CSS multi-column reflowable pagination, EPUB CFI canonical bookmarks, font typography, and AMOLED/E-Ink optimizations.'
  },
  {
    id: '75-flutter-and-multiplatform-dart',
    name: 'flutter-and-multiplatform-dart',
    path: 'skills/75-flutter-and-multiplatform-dart/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Cross-platform Flutter 3 with Impeller GPU rendering, BLoC state management, custom painters, platform channels, and adaptive layouts for foldables and tablets.'
  },
  {
    id: '76-mobile-offline-sync-and-sqlite-architecture',
    name: 'mobile-offline-sync-and-sqlite-architecture',
    path: 'skills/76-mobile-offline-sync-and-sqlite-architecture/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Local-first mobile architecture, SQLCipher AES-256 database encryption, SQLite FTS5 full-text search, optimistic writes, and offline outbox sync workers.'
  },
  {
    id: '77-push-notifications-and-deep-linking',
    name: 'push-notifications-and-deep-linking',
    path: 'skills/77-push-notifications-and-deep-linking/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Unified push notification delivery with Apple APNs and Google FCM v1, Notification Service payload decryptors, iOS Universal Links, and Android App Links.'
  },
  {
    id: '78-mobile-security-and-tamper-resistance',
    name: 'mobile-security-and-tamper-resistance',
    path: 'skills/78-mobile-security-and-tamper-resistance/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Client-side hardening, Root & Jailbreak detection, Google Play Integrity attestation, SSL public key hash pinning, Secure Enclave / KeyStore, and R8 obfuscation.'
  },
  {
    id: '79-mobile-performance-profiling-and-battery',
    name: 'mobile-performance-profiling-and-battery',
    path: 'skills/79-mobile-performance-profiling-and-battery/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Frame rate optimization (60/120 FPS jank elimination), memory leak diagnosis with LeakCanary and Instruments, cold startup benchmarks, and battery radio conservation.'
  },
  {
    id: '80-mobile-cicd-fastlane-and-store-deployment',
    name: 'mobile-cicd-fastlane-and-store-deployment',
    path: 'skills/80-mobile-cicd-fastlane-and-store-deployment/SKILL.md',
    category: 'Mobile & Multi-Platform Engineering',
    summary: 'Automated mobile release pipelines with Fastlane, iOS Match certificates, Google Play App Signing, TestFlight, staged rollouts, OTA updates, and store compliance.'
  }
];

for (const skill of newSkills) {
  if (!data.skills.some(s => s.id === skill.id)) {
    data.skills.push(skill);
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully updated skills.json: ${data.tracks.length} tracks, ${data.skills.length} skills`);

// Also update docs/skills-data.js
const docsDataPath = path.join(__dirname, '..', 'docs', 'skills-data.js');
const jsContent = 'window.SKILLS_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(docsDataPath, jsContent);
console.log('Successfully updated docs/skills-data.js');
