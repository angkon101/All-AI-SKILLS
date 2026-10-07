---
name: native-android-kotlin-and-jetpack-compose
description: Modern native Android architecture with Kotlin, Jetpack Compose, Material 3, StateFlow, Room local database, and battery-aware WorkManager background workers.
---

# 🤖 Native Android Architecture: Kotlin & Jetpack Compose

## 🎯 Role & Objective
As a **Principal Android Software Engineer**, your objective is to architect resilient, battery-efficient, and fluid Android applications utilizing **Kotlin**, **Jetpack Compose (Material 3)**, **Kotlin Coroutines / StateFlow**, and **Clean Architecture (MVVM/MVI)**. You eliminate legacy XML layouts and Fragment lifecycles, optimize list recycling using Compose `LazyColumn`, persist offline data in **Room**, and schedule battery-conscious background synchronizations with **WorkManager**.

---

## 🏛️ Android Modern Architecture Layers

```mermaid
flowchart TD
    UI["Jetpack Compose UI (Stateless Composables)"] -->|Events (User Clicks)| VM["ViewModel (StateFlow Exposure)"]
    VM -->|State (collectAsStateWithLifecycle)| UI
    VM --> UC["Domain Use Cases (Business Logic)"]
    UC --> REPO["Repository Pattern (Single Source of Truth)"]
    REPO -->|Remote Data (Retrofit/Ktor)| API["Backend REST / gRPC API"]
    REPO -->|Local Cache (Flow)| ROOM["Room Database (SQLite)"]
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Unidirectional Data Flow ViewModel with StateFlow

```kotlin
// ui/books/BookListViewModel.kt
package com.acme.ereader.ui.books

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.acme.ereader.data.repository.BookRepository
import com.acme.ereader.model.Book
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface BookUiState {
    object Loading : BookUiState
    data class Success(val books: List<Book>, val currentReadingId: String?) : BookUiState
    data class Error(val message: String) : BookUiState
}

class BookListViewModel(
    private val bookRepository: BookRepository
) : ViewModel() {

    // Expose cold Flow as hot StateFlow bounded by ViewModel lifecycle (5s stop timeout for configuration changes)
    val uiState: StateFlow<BookUiState> = bookRepository.observeBooks()
        .map { books -> BookUiState.Success(books = books, currentReadingId = books.firstOrNull()?.id) }
        .catch { e -> emit(BookUiState.Error(e.message ?: "Unknown error occurred")) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = BookUiState.Loading
        )

    fun deleteBook(bookId: String) {
        viewModelScope.launch {
            bookRepository.deleteBook(bookId)
        }
    }
}
```

---

### Step 2: High-Performance Jetpack Compose UI (Material 3)

```kotlin
// ui/books/BookListScreen.kt
package com.acme.ereader.ui.books

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.acme.ereader.model.Book

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookListScreen(
    viewModel: BookListViewModel,
    onBookClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Collect state lifecycle-aware: automatically suspends collection when app is in background
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Library", style = MaterialTheme.typography.titleLarge) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val current = state) {
                is BookUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is BookUiState.Error -> {
                    Text(
                        text = current.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is BookUiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Key parameter is critical for LazyColumn recycling efficiency and animations
                        items(items = current.books, key = { it.id }) { book ->
                            BookCard(
                                book = book,
                                onClick = { onBookClick(book.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BookCard(book: Book, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = book.title, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Author: ${book.author} • Progress: ${book.progressPercent}%",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
```

---

### Step 3: Battery-Aware Background Sync (WorkManager)

Schedule periodic background downloads only when the device is unmetered (Wi-Fi) and connected to a power charger.

```kotlin
// workers/BookSyncWorker.kt
package com.acme.ereader.workers

import android.content.Context
import androidx.work.*
import com.acme.ereader.data.repository.BookRepository
import java.util.concurrent.TimeUnit

class BookSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters,
    private val bookRepository: BookRepository
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            bookRepository.syncReadingProgressWithCloud()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    companion object {
        fun schedulePeriodicSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED) // Only Wi-Fi
                .setRequiresBatteryNotLow(true)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<BookSyncWorker>(6, TimeUnit.HOURS)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "PeriodicBookSync",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
```

---

## 📋 Security & Quality Checklist

- [ ] **Lifecycle-Aware Collection**: Composables use `collectAsStateWithLifecycle()` to cease listening to StateFlow when the Activity is stopped.
- [ ] **LazyColumn Keys Provided**: Every list item specifies `key = { it.id }` to prevent full recomposition during item insertions and reorders.
- [ ] **Battery Constraints on Background Tasks**: `WorkManager` requires `NetworkType.CONNECTED` and `setRequiresBatteryNotLow(true)`.
- [ ] **Room DB on Background Dispatcher**: All Room queries execute within `withContext(Dispatchers.IO)` or return reactive `Flow<T>`.
- [ ] **Edge-to-Edge Enabled**: `enableEdgeToEdge()` declared in `MainActivity` with Material 3 window insets properly applied.
- [ ] **Memory Leaks Prevented**: ViewModels never hold references to `Context`, `View`, or `Activity`.
