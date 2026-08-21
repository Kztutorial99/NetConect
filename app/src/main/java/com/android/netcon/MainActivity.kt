package com.android.netcon

import android.content.ComponentName
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val status = findViewById<TextView>(R.id.textStatus)
        val info = findViewById<TextView>(R.id.textInfo)

        info.text = buildString {
            append("Package: ").append(packageName).append("\n")
            append("API: ").append(BuildConfig.API_URL.ifBlank { "(not set)" }).append("\n")
            append("Device: ").append(BuildConfig.DEVICE_ID.ifBlank { "(not set)" })
        }

        findViewById<Button>(R.id.btnPermission).setOnClickListener {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }

        findViewById<Button>(R.id.btnTest).setOnClickListener {
            ApiSender.sendNotification(
                apiUrl = BuildConfig.API_URL,
                ingestToken = BuildConfig.INGEST_TOKEN,
                deviceId = BuildConfig.DEVICE_ID,
                packageName = packageName,
                title = "Test Notification",
                body = "NetConect is working!"
            )
            status.text = "Test notification sent!"
        }

        status.text = if (isListenerEnabled()) "Listener: ACTIVE" else "Listener: NOT ACTIVE"
    }

    private fun isListenerEnabled(): Boolean {
        val cn = ComponentName(this, NotificationListener::class.java)
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat?.contains(cn.flattenToString()) == true
    }
}
