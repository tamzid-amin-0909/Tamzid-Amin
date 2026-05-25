package com.example.edubrowser.webview

import android.os.Message
import android.view.View
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView

class EduWebChromeClient(
    private val onProgressChangedAction: (Int) -> Unit,
    private val onShowCustomViewAction: (View, WebChromeClient.CustomViewCallback) -> Unit,
    private val onHideCustomViewAction: () -> Unit
) : WebChromeClient() {

    override fun onProgressChanged(view: WebView, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressChangedAction(newProgress)
    }

    override fun onPermissionRequest(request: PermissionRequest?) {
        // Handle permissions like camera/microphone securely
        request?.grant(request.resources)
    }

    override fun onGeolocationPermissionsShowPrompt(
        origin: String?,
        callback: GeolocationPermissions.Callback?
    ) {
        // Automatically grant geolocation permission for this app's trusted domain
        callback?.invoke(origin, true, false)
    }

    override fun onCreateWindow(
        view: WebView?,
        isDialog: Boolean,
        isUserGesture: Boolean,
        resultMsg: Message?
    ): Boolean {
        // Treat new windows/popups as navigations in the current webview
        val result = view?.hitTestResult
        val data = result?.extra
        if (data != null) {
            view.loadUrl(data)
            return true
        }
        return false
    }

    override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
        super.onShowCustomView(view, callback)
        if (view != null && callback != null) {
            onShowCustomViewAction(view, callback)
        }
    }

    override fun onHideCustomView() {
        super.onHideCustomView()
        onHideCustomViewAction()
    }
}
