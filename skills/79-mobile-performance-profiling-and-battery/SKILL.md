---
name: Mobile Performance Profiling and Battery Conservation
description: Frame rate optimization (60/120 FPS), memory leak elimination with LeakCanary and Xcode Instruments, startup time benchmarking, and battery-aware background processing.
version: 1.0.0
category: mobile-engineering
tags:
  - mobile-performance
  - frame-rate
  - battery-optimization
  - perfetto
  - xcode-instruments
  - leakcanary
  - memory-management
  - metric-kit
---

# Mobile Performance Profiling and Battery Conservation

Mobile devices operate under aggressive thermal throttling, hardware power constraints, and variable refresh rates (120Hz ProMotion / Smooth Display). Delivering a seamless user experience requires maintaining strict render frame budgets (8.33ms at 120Hz, 16.6ms at 60Hz), eliminating retain cycles/leaks, and minimizing cellular radio wakeups.

---

## 1. Frame Budget & Render Pipeline Topography

```
120Hz Display: 8.33ms Budget  │  60Hz Display: 16.6ms Budget
┌─────────────────────────────────────────────────────────────┐
│ UI Thread                                                   │
│ [Event] ➔ [State Mutate] ➔ [Measure / Layout] ➔ [Draw Calls]│
└──────────────────────────────┬──────────────────────────────┘
                               │ Sync display list
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Render Thread / GPU                                         │
│ [Execute GL/Vulkan/Metal] ➔ [Rasterize] ➔ [Buffer Swap]     │
└─────────────────────────────────────────────────────────────┘
  Over budget ➔ Dropped Frame (Jank) ➔ Stuttering UX
```

---

## 2. iOS Performance & Diagnostic Monitoring (MetricKit)

MetricKit aggregates on-device battery drain, hang rates, launch metrics, and memory terminations directly from end-user devices without third-party SDK overhead.

Save to: `ios/App/Diagnostics/PerformanceMetricsSubscriber.swift`

```swift
import Foundation
import MetricKit
import os.log

final class PerformanceMetricsSubscriber: NSObject, MXMetricManagerSubscriber {
    static let shared = PerformanceMetricsSubscriber()
    private let logger = Logger(subsystem: "com.enterprise.app", category: "Performance")

    func startMonitoring() {
        MXMetricManager.shared.add(self)
    }

    func stopMonitoring() {
        MXMetricManager.shared.remove(self)
    }

    // Daily aggregate metrics
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            // 1. Analyze Hang Rates (UI unresponsiveness)
            if let hangMetrics = payload.applicationResponsivenessMetrics {
                logger.info("Total Hang Time: \(hangMetrics.histogrammedHangDuration)")
            }

            // 2. Cold / Warm App Launch Time
            if let launchMetrics = payload.applicationLaunchMetrics {
                logger.info("TimeToFirstDraw: \(launchMetrics.histogrammedTimeToFirstDraw)")
                logger.info("ApplicationResumeTime: \(launchMetrics.histogrammedApplicationResumeTime)")
            }

            // 3. Memory & Out-Of-Memory (Jetsam) Footprint
            if let memoryMetrics = payload.memoryMetrics {
                let peakMemory = memoryMetrics.peakMemoryUsage.value
                logger.info("Peak Memory Usage: \(peakMemory) bytes")
            }

            // 4. Energy & Cellular Radio Drain
            if let cellularMetrics = payload.networkTransferMetrics {
                logger.info("Cellular Upload: \(cellularMetrics.cumulativeCellularUpload.value) bytes")
                logger.info("Cellular Download: \(cellularMetrics.cumulativeCellularDownload.value) bytes")
            }
        }
    }

    // Real-time crash and hang diagnostics
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for diagnostic in payloads {
            if let hangDiagnostics = diagnostic.hangDiagnostics {
                for hang in hangDiagnostics {
                    logger.error("Recorded Hang Callstack:\n\(hang.callStackTree.jsonRepresentation())")
                }
            }
            if let cpuExceptions = diagnostic.cpuExceptionDiagnostics {
                for cpu in cpuExceptions {
                    logger.error("High CPU Usage Triggered: \(cpu.totalCpuTime)")
                }
            }
        }
    }
}
```

---

## 3. Android Jetpack Macrobenchmark (Startup & Frame Jank)

Ensure cold startup times remain under 500ms using Baseline Profiles and Macrobenchmarks.

Save to: `benchmark/src/main/java/com/enterprise/app/benchmark/StartupBenchmark.kt`

```kotlin
package com.enterprise.app.benchmark

import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.ExperimentalMetricApi
import androidx.benchmark.macro.FrameTimingMetric
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.TraceSectionMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class StartupBenchmark {

    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun benchmarkColdStartupWithBaselineProfiles() = benchmarkRule.measureRepeated(
        packageName = "com.enterprise.readerapp",
        metrics = listOf(
            StartupTimingMetric(),
            FrameTimingMetric()
        ),
        compilationMode = CompilationMode.Partial(), // Baseline Profiles enabled
        iterations = 10,
        startupMode = StartupMode.COLD
    ) {
        pressHome()
        startActivityAndWait()
    }

    @OptIn(ExperimentalMetricApi::class)
    @Test
    fun benchmarkBookReaderScrollPerformance() = benchmarkRule.measureRepeated(
        packageName = "com.enterprise.readerapp",
        metrics = listOf(
            FrameTimingMetric(),
            TraceSectionMetric("ReaderPaginationLayout")
        ),
        compilationMode = CompilationMode.Full(),
        iterations = 5,
        startupMode = StartupMode.WARM
    ) {
        startActivityAndWait()
        
        // Execute smooth swipe interactions across book chapters
        device.waitForIdle()
        val scrollContainer = device.findObject(androidx.test.uiautomator.By.res("reader_viewport"))
        scrollContainer.setGestureMargin(device.displayWidth / 5)
        repeat(5) {
            scrollContainer.scroll(androidx.test.uiautomator.Direction.RIGHT, 1.0f)
            device.waitForIdle()
        }
    }
}
```

---

## 4. Battery-Aware Background Processing & Cellular Radio Throttling

Cellular radios consume peak power (high-power state DCH/RRC Connected) for up to 20 seconds after transmission before dropping back to idle. Firing unbatched network requests drains battery exponentially.

### Android Exponential Batching with WorkManager
Save to: `android/app/src/main/kotlin/com/enterprise/app/worker/BatteryEfficientSyncWorker.kt`

```kotlin
package com.enterprise.app.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class BatteryEfficientSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // Flush batched reading progress, telemetry, and offline outbox
            SyncRepository.flushPendingOutbox()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        fun schedule(context: Context) {
            // Strict power constraints: Run only when unmetered network & not battery low
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED)
                .setRequiresBatteryNotLow(true)
                .setRequiresStorageNotLow(true)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<BatteryEfficientSyncWorker>(
                6, TimeUnit.HOURS,
                30, TimeUnit.MINUTES // Flex window allows OS to batch alongside other jobs
            )
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "TelemetrySyncJob",
                androidx.work.ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
```

---

## 5. Memory Leak Elimination (Retain Cycles & Bitmap Recycling)

### A. Swift Retain Cycle Elimination
```swift
// WRONG: Retain cycle created by capturing strong self in closure
class ChapterReaderController {
    var onPageTurned: (() -> Void)?
    var pageCache = [Int: Data]()

    func setupObserver() {
        onPageTurned = {
            self.pageCache.removeAll() // Strong reference cycle!
        }
    }
}

// CORRECT: Weak capture with guard binding
class SecureChapterReaderController {
    var onPageTurned: (() -> Void)?
    var pageCache = [Int: Data]()

    func setupObserver() {
        onPageTurned = { [weak self] in
            guard let self = self else { return }
            self.pageCache.removeAll()
        }
    }
}
```

### B. Android Bitmap Memory Pooling (`inBitmap`)
```kotlin
fun decodeSampledBitmapFromResource(
    res: Resources,
    resId: Int,
    reqWidth: Int,
    reqHeight: Int,
    reusableBitmap: Bitmap?
): Bitmap {
    return BitmapFactory.Options().run {
        inJustDecodeBounds = true
        BitmapFactory.decodeResource(res, resId, this)

        inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
        inJustDecodeBounds = false
        inMutable = true
        
        // Re-use existing allocated pixel buffer without garbage collector pauses
        if (reusableBitmap != null && reusableBitmap.isMutable && !reusableBitmap.isRecycled) {
            inBitmap = reusableBitmap
        }

        BitmapFactory.decodeResource(res, resId, this)
    }
}
```

---

## 6. Verification Checklist

- [ ] 120Hz Jank Test: Validate zero dropped frames on ProMotion / 120Hz devices during fast fling operations.
- [ ] LeakCanary Audit: Verify zero retained Activity or Fragment instances in Debug builds.
- [ ] Baseline Profiles: Generate and bundle `baseline-prof.txt` with Android Release AAB.
- [ ] Radio Wakeup Check: Batch analytics and sync calls into unified periodic bursts to preserve radio idle state.
- [ ] Background Memory (Jetsam): Ensure memory footprint remains below 45MB while in background state.
