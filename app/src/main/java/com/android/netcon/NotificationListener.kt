package com.android.netcon

import android.app.Notification
import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class NotificationListener : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val prefs = getSharedPreferences("netcon", Context.MODE_PRIVATE)
        val filter = prefs.getString("pkg_filter", "")?.trim().orEmpty()
        val pkg = sbn.packageName ?: return

        if (filter.isNotEmpty()) {
            val allowed = filter.split(",").map { it.trim() }.filter { it.isNotEmpty() }
            if (allowed.isNotEmpty() && pkg !in allowed) return
        }

        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()

        if (title.isBlank() && text.isBlank()) return

        val msg = buildString {
            append("\uD83D\uDCF2 <b>").append(escape(pkg)).append("</b>\n")
            if (title.isNotBlank()) append("<b>").append(escape(title)).append("</b>\n")
            if (text.isNotBlank()) append(escape(text))
        }
        TelegramSender.send(this, msg)
    }

    private fun escape(s: String): String =
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
}
