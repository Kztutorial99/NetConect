package com.android.netcon

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val prefs = getSharedPreferences("netcon", Context.MODE_PRIVATE)
        val tokenEdit = findViewById<EditText>(R.id.editToken)
        val chatEdit = findViewById<EditText>(R.id.editChatId)
        val filterEdit = findViewById<EditText>(R.id.editFilter)
        val status = findViewById<TextView>(R.id.textStatus)

        tokenEdit.setText(prefs.getString("bot_token", ""))
        chatEdit.setText(prefs.getString("chat_id", ""))
        filterEdit.setText(prefs.getString("pkg_filter", ""))

        findViewById<Button>(R.id.btnSave).setOnClickListener {
            prefs.edit()
                .putString("bot_token", tokenEdit.text.toString().trim())
                .putString("chat_id", chatEdit.text.toString().trim())
                .putString("pkg_filter", filterEdit.text.toString().trim())
                .apply()
            Toast.makeText(this, "Tersimpan", Toast.LENGTH_SHORT).show()
        }

        findViewById<Button>(R.id.btnPermission).setOnClickListener {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }

        findViewById<Button>(R.id.btnTest).setOnClickListener {
            TelegramSender.send(this, "\uD83E\uDDEA Test dari NetCon berhasil!")
            Toast.makeText(this, "Mengirim test...", Toast.LENGTH_SHORT).show()
        }

        status.text = if (isListenerEnabled()) "Listener: AKTIF" else "Listener: BELUM AKTIF"
    }

    private fun isListenerEnabled(): Boolean {
        val cn = ComponentName(this, NotificationListener::class.java)
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat?.contains(cn.flattenToString()) == true
    }
}
