package com.example.edubrowser.webview

import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView

class EduWebChromeClient(
    private val onProgressChangedAction: (Int) -> Unit
) : WebChromeClient() {

    override fun onProgressChanged(view: WebView, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressChangedAction(newProgress)
    }

    override fun onPermissionRequest(request: PermissionRequest?) {
        // Handle permissions like camera/microphone securely
        request?.grant(request.resources)
    }
}
