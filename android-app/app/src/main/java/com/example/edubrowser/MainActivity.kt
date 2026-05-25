package com.example.edubrowser

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import com.example.edubrowser.constants.Constants
import com.example.edubrowser.databinding.ActivityMainBinding
import com.example.edubrowser.network.NetworkMonitor
import com.example.edubrowser.webview.EduWebChromeClient
import com.example.edubrowser.webview.EduWebViewClient
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var networkMonitor: NetworkMonitor
    
    // Video Fullscreen Support
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        hideSystemUI()

        networkMonitor = NetworkMonitor(this)
        
        setupWebView(savedInstanceState)
        setupOfflineUi()
        observeNetwork()
        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView(savedInstanceState: Bundle?) {
        val webSettings = binding.webView.settings
        
        // General Browser Settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.mediaPlaybackRequiresUserGesture = false
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        webSettings.allowFileAccess = false // disable insecure file URL access
        webSettings.allowContentAccess = false 
        webSettings.safeBrowsingEnabled = true // Safe Browsing enabled
        
        // Realistic Browser User Agent (append identifier)
        val originalUserAgent = webSettings.userAgentString
        if (!originalUserAgent.contains(Constants.USER_AGENT_SUFFIX)) {
            webSettings.userAgentString = originalUserAgent + Constants.USER_AGENT_SUFFIX
        }

        // Cookie configuration
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.webViewClient = EduWebViewClient(
            context = this,
            onPageFinishedAction = {
                binding.swipeRefreshLayout.isRefreshing = false
                binding.progressBar.visibility = View.GONE
            },
            onErrorAction = {
                showOfflineUi()
            }
        )

        binding.webView.webChromeClient = EduWebChromeClient(
            onProgressChangedAction = { progress ->
                if (progress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = progress
                } else {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            },
            onShowCustomViewAction = { view, callback ->
                if (customView != null) {
                    callback.onCustomViewHidden()
                    return@EduWebChromeClient
                }
                customView = view
                customViewCallback = callback
                binding.fullscreenContainer.addView(view)
                binding.fullscreenContainer.visibility = View.VISIBLE
                binding.swipeRefreshLayout.visibility = View.GONE
            },
            onHideCustomViewAction = {
                if (customView == null) return@EduWebChromeClient
                binding.fullscreenContainer.removeView(customView)
                customView = null
                binding.fullscreenContainer.visibility = View.GONE
                binding.swipeRefreshLayout.visibility = View.VISIBLE
                customViewCallback?.onCustomViewHidden()
                customViewCallback = null
            }
        )

        // Load Main Website
        if (savedInstanceState == null) {
            binding.webView.loadUrl(Constants.MAIN_URL)
        }
    }

    private fun setupOfflineUi() {
        binding.btnRetry.setOnClickListener {
            binding.offlineUi.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
            binding.webView.reload()
        }
    }

    private fun showOfflineUi() {
        binding.webView.visibility = View.GONE
        binding.offlineUi.visibility = View.VISIBLE
        binding.progressBar.visibility = View.GONE
        binding.swipeRefreshLayout.isRefreshing = false
    }

    private fun observeNetwork() {
        lifecycleScope.launch {
            networkMonitor.isConnected.collectLatest { isConnected ->
                if (isConnected && binding.offlineUi.visibility == View.VISIBLE) {
                    binding.offlineUi.visibility = View.GONE
                    binding.webView.visibility = View.VISIBLE
                    binding.webView.reload()
                } else if (!isConnected) {
                    showOfflineUi()
                }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        binding.webView.restoreState(savedInstanceState)
    }

    override fun onBackPressed() {
        if (customView != null) {
            binding.webView.webChromeClient?.onHideCustomView()
            return
        }
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun hideSystemUI() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, binding.root).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }
}
