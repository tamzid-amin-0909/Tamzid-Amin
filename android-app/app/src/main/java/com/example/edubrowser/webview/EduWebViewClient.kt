package com.example.edubrowser.webview

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.browser.customtabs.CustomTabsIntent
import com.example.edubrowser.constants.Constants

class EduWebViewClient(
    private val context: Context,
    private val onPageFinishedAction: () -> Unit,
    private val onErrorAction: () -> Unit
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()
        val uri = Uri.parse(url)
        val host = uri.host ?: ""

        // Navigation Rules
        if (host.contains(Constants.DOMAIN_HOST) || host.contains("example.com")) {
            // inside WebView
            return false
        }
        
        if (url.startsWith("https://wa.me") || url.startsWith("whatsapp:")) {
            // WhatsApp links inside WebView based on requirements
            return false
        }

        if (url.startsWith("https://t.me") || url.startsWith("tg:")) {
            openExternalIntent(uri)
            return true
        }

        if (host.contains("facebook.com")) {
            openExternalIntent(uri)
            return true
        }

        if (host.contains("youtube.com") || host.contains("youtu.be")) {
            // OPTION B: Chrome Custom Tabs
            openCustomTab(uri)
            return true
        }
        
        if (url.startsWith("intent://")) {
            openExternalIntent(uri)
            return true
        }

        // other links inside webview
        return false
    }

    private fun openExternalIntent(uri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, uri)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } catch (e: Exception) {
            // Handle activity not found naturally
        }
    }

    private fun openCustomTab(uri: Uri) {
        val customTabsIntent = CustomTabsIntent.Builder().build()
        customTabsIntent.launchUrl(context, uri)
    }

    override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
    }

    override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)
        onPageFinishedAction()
    }

    override fun onReceivedError(
        view: WebView,
        request: WebResourceRequest,
        error: WebResourceError
    ) {
        super.onReceivedError(view, request, error)
        if (request.isForMainFrame) {
            onErrorAction()
        }
    }

    override fun onReceivedSslError(
        view: WebView,
        handler: android.webkit.SslErrorHandler,
        error: android.net.http.SslError
    ) {
        // Proceed automatically for free hosting subdomains which might have SSL issues
        handler.proceed()
    }
}
