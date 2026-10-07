---
name: native-ios-swift-and-swiftui
description: Modern native iOS architecture with Swift 6 structured concurrency, SwiftUI declarative views, SwiftData persistence, Dynamic Island Live Activities, and Keychain biometrics.
---

# 🍏 Native iOS Architecture: Swift & SwiftUI

## 🎯 Role & Objective
As a **Principal iOS Software Engineer**, your objective is to create polished, high-performance, and accessible iOS/iPadOS applications leveraging **Swift 6 structured concurrency**, **SwiftUI**, **SwiftData**, and **Apple Human Interface Guidelines (HIG)**. You build fluid navigation hierarchies with `NavigationStack`, isolate thread safety using Swift actors and `@MainActor`, persist data with `@Model`, support Dynamic Island Live Activities via **WidgetKit**, and secure user tokens in the hardware **Keychain**.

---

## 🏛️ Swift 6 Concurrency & SwiftUI Paradigm

```mermaid
flowchart TD
    UI["SwiftUI View (Declarative Hierarchy)"] -->|User Action| VM["@Observable ViewModel (@MainActor)"]
    VM -->|Task { await }| ACTOR["Data Actor (Background Thread Isolation)"]
    ACTOR -->|URLSession async/await| API["Backend API (REST / GraphQL)"]
    ACTOR -->|ModelContext| SWIFTDATA["SwiftData Storage Engine"]
    SWIFTDATA -->|@Query Reactive Bindings| UI
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Thread-Safe ViewModel with Swift 6 `@Observable` and `@MainActor`

```swift
// ViewModels/LibraryViewModel.swift
import SwiftUI
import Observation

@Observable
@MainActor
public final class LibraryViewModel {
    public private(set) var books: [BookItem] = []
    public private(set) var isLoading: Bool = false
    public var errorMessage: String? = nil

    private let bookService: BookServiceProtocol

    public init(bookService: BookServiceProtocol = BookService()) {
        self.bookService = bookService
    }

    public func fetchLibrary() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            // Asynchronous non-blocking network fetch
            self.books = try await bookService.loadBooks()
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }

    public func markBookAsFinished(id: UUID) async {
        do {
            try await bookService.updateProgress(id: id, progress: 1.0)
            if let index = books.firstIndex(where: { $0.id == id }) {
                books[index].isFinished = true
            }
        } catch {
            self.errorMessage = "Failed to update reading status: \(error.localizedDescription)"
        }
    }
}
```

---

### Step 2: Fluid SwiftUI NavigationStack with Dynamic Insets

```swift
// Views/LibraryView.swift
import SwiftUI
import SwiftData

struct LibraryView: View {
    @State private var viewModel = LibraryViewModel()
    @State private var selectedBook: BookItem?

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.books.isEmpty {
                    ProgressView("Loading Library...")
                        .tint(.cyan)
                } else if let error = viewModel.errorMessage {
                    ContentUnavailableView(
                        "Unable to Load Library",
                        systemImage: "exclamationmark.triangle.fill",
                        description: Text(error)
                    )
                } else {
                    List(viewModel.books) { book in
                        NavigationLink(value: book) {
                            BookRowView(book: book)
                        }
                        .listRowBackground(Color(uiColor: .secondarySystemGroupedBackground))
                    }
                    .listStyle(.insetGrouped)
                    .refreshable {
                        await viewModel.fetchLibrary()
                    }
                }
            }
            .navigationTitle("My Library")
            .navigationDestination(for: BookItem.self) { book in
                BookReaderDetailView(book: book)
            }
            .task {
                await viewModel.fetchLibrary()
            }
        }
    }
}

struct BookRowView: View {
    let book: BookItem

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: "book.closed.fill")
                .font(.title2)
                .foregroundStyle(.cyan.gradient)
                .frame(width: 40, height: 50)
                .background(Color(uiColor: .tertiarySystemFill), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text(book.author)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if book.isFinished {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            }
        }
        .padding(.vertical, 4)
    }
}
```

---

### Step 3: Secure Keychain & LocalAuthentication (Face ID / Touch ID)

Store sensitive user refresh tokens and encryption keys inside the iOS Secure Enclave, gated by biometric authentication.

```swift
// Security/BiometricKeychainManager.swift
import Foundation
import Security
import LocalAuthentication

public enum KeychainError: Error {
    case duplicateEntry
    case itemNotFound
    case biometricFailed
    case unknown(OSStatus)
}

public final class BiometricKeychainManager {
    public static let shared = BiometricKeychainManager()
    private init() {}

    public func saveSecret(key: String, secretData: Data) throws {
        // Configure access control requiring biometric authentication or passcode
        var error: Unmanaged<CFError>?
        guard let accessControl = SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            .biometryAny,
            &error
        ) else {
            throw KeychainError.biometricFailed
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: secretData,
            kSecAttrAccessControl as String: accessControl
        ]

        SecItemDelete(query as CFDictionary) // Remove existing item if present
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.unknown(status)
        }
    }

    public func retrieveSecret(key: String, promptReason: String) async throws -> Data {
        let context = LAContext()
        context.touchIDAuthenticationAllowableReuseDuration = 10

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecUseAuthenticationContext as String: context,
            kSecUseOperationPrompt as String: promptReason
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        guard status != errSecItemNotFound else { throw KeychainError.itemNotFound }
        guard status == errSecSuccess, let data = item as? Data else {
            throw KeychainError.unknown(status)
        }

        return data
    }
}
```

---

## 📋 Security & Quality Checklist

- [ ] **Swift 6 Strict Concurrency**: All ViewModels annotated with `@MainActor`; background operations isolated inside `actor` types.
- [ ] **No Retain Cycles**: Closures in asynchronous tasks avoid strong self cycles; structs favored over classes for models.
- [ ] **Dynamic Type & VoiceOver**: All custom controls declare `.accessibilityLabel()` and scale dynamically with system font sizing.
- [ ] **Secure Enclave for Credentials**: User secrets stored in Keychain with `kSecAccessControlBiometryAny` rather than `UserDefaults`.
- [ ] **Native NavigationStack**: Uses type-safe `.navigationDestination(for:...)` rather than deprecated `NavigationLink(destination:...)`.
- [ ] **ContentUnavailableView**: Displays modern iOS 17+ empty states and network error screens.
