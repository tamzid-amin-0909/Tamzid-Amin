package com.example.edubrowser.security

import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

object OkHttpPinner {
    // strict SSL certificate pinning mapping the requirements
    fun getSecureClient(): OkHttpClient {
        val certificatePinner = CertificatePinner.Builder()
            // hard pin the production domain certificate/public key
            .add("everythingfree.iceiy.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .add("everythingfree.iceiy.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
            .build()
            
        return OkHttpClient.Builder()
            .certificatePinner(certificatePinner)
            .build()
    }
}
