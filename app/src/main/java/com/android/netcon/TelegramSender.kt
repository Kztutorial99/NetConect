package com.android.netcon

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

object TelegramSender {
    fun send(ctx: Context, text: String) {
        val prefs = ctx.getSharedPreferences("netcon", Context.MODE_PRIVATE)
        val token = prefs.getString("bot_token", "")?.trim().orEmpty()
        val chatId = prefs.getString("chat_id", "")?.trim().orEmpty()
        if (token.isEmpty() || chatId.isEmpty()) return

        CoroutineScope(Dispatchers.IO).launch {
            runCatching {
                val body = "chat_id=" + URLEncoder.encode(chatId, "UTF-8") +
                        "&text=" + URLEncoder.encode(text, "UTF-8") +
                        "&parse_mode=HTML&disable_web_page_preview=true"
                val url = URL("https://api.telegram.org/bot$token/sendMessage")
                (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    doOutput = true
                    setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
                    outputStream.use { it.write(body.toByteArray()) }
                    inputStream.use { it.readBytes() }
                    disconnect()
                }
            }
        }
    }
}
