package com.investmentresearch.controller;

import com.investmentresearch.dto.ApiResponse;
import com.sun.management.OperatingSystemMXBean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class SystemController {

    @GetMapping("/system/metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getSystemMetrics() {
        try {
            Map<String, Object> metrics = new HashMap<>();

            // CPU
            try {
                OperatingSystemMXBean osBean =
                        (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
                double cpu = osBean.getCpuLoad() * 100;
                metrics.put("cpuUsage", Math.max(0, Math.round(cpu * 10.0) / 10.0));
            } catch (Exception e) {
                metrics.put("cpuUsage", -1);
            }

            // Memory (JVM heap as proxy)
            Runtime rt = Runtime.getRuntime();
            long maxMem  = rt.maxMemory()  / (1024 * 1024);
            long usedMem = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
            metrics.put("memoryUsed",    usedMem);
            metrics.put("memoryTotal",   maxMem);
            metrics.put("memoryPercent", maxMem > 0
                    ? Math.round((double) usedMem / maxMem * 1000.0) / 10.0 : 0);

            // Disk
            try {
                File root = new File(System.getProperty("user.home"));
                long diskTotal = root.getTotalSpace() / (1024L * 1024 * 1024);
                long diskFree  = root.getFreeSpace()  / (1024L * 1024 * 1024);
                long diskUsed  = diskTotal - diskFree;
                metrics.put("diskTotal",   diskTotal);
                metrics.put("diskUsed",    diskUsed);
                metrics.put("diskPercent", diskTotal > 0
                        ? Math.round((double) diskUsed / diskTotal * 1000.0) / 10.0 : 0);
            } catch (Exception e) {
                metrics.put("diskTotal",   0);
                metrics.put("diskUsed",    0);
                metrics.put("diskPercent", 0);
            }

            // Uptime
            long uptimeMs  = ManagementFactory.getRuntimeMXBean().getUptime();
            long uptimeSec = uptimeMs / 1000;
            long hours     = uptimeSec / 3600;
            long mins      = (uptimeSec % 3600) / 60;
            metrics.put("uptime", hours + "h " + mins + "m");
            metrics.put("status", "OK");

            return ResponseEntity.ok(new ApiResponse<>(true, "System metrics retrieved", metrics));
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", e.getMessage());
            return ResponseEntity.ok(new ApiResponse<>(true, "Metrics partially unavailable", err));
        }
    }

    @GetMapping("/system/logs")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getSystemLogs() {
        try {
            java.util.List<Map<String, String>> logs = new java.util.ArrayList<>();
            // In a real application, read from a log file like logs/spring.log
            // Here we provide sample logs for demonstration
            logs.add(Map.of("timestamp", new java.util.Date().toString(), "level", "INFO", "message", "Application started successfully"));
            logs.add(Map.of("timestamp", new java.util.Date().toString(), "level", "DEBUG", "message", "Database connection pool initialized"));
            logs.add(Map.of("timestamp", new java.util.Date().toString(), "level", "INFO", "message", "Security configuration loaded"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Failed to retrieve logs", null));
        }
    }
}
