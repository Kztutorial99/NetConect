package com.android.netcon

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object ApiSender {
    private const val TAG = "NetConApi"

    fun sendNotification(
        apiUrl: String,
        ingestToken: String,
        deviceId: String,
        packageName: String,
        title: String,
        body: String
    ) {
        if (apiUrl.isBlank() || ingestToken.isBlank()) {
            Log.w(TAG, "API URL or ingest token not configured")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            runCatching {
                val json = JSONObject().apply {
                    put("device_id", deviceId.ifBlank { "unknown" })
                    put("package_name", packageName)
                    put("title", title)
                    put("body", body)
                    put("posted_at", System.currentTimeMillis().toString())
                }

                val url = URL("$apiUrl/api/ingest")
                (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("x-ingest-token", ingestToken)
                    connectTimeout = 10_000
                    readTimeout = 10_000
                    outputStream.use { it.write(json.toString().toByteArray()) }
                    val responseCode = responseCode
                    if (responseCode !in 200..299) {
                        Log.w(TAG, "Ingest returned $responseCode")
                    }
                    disconnect()
                }
            }.onFailure {
                Log.e(TAG, "Failed to send notification", it)
            }
        }
    }
}
