/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, Smartphone, ShieldCheck, Code } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-b from-neutral-800 to-neutral-800/80">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">Android Source Ready</h1>
          <p className="text-neutral-400 max-w-md mx-auto text-lg">
            Your native Kotlin production-ready browser app has been generated.
          </p>
        </div>

        <div className="px-8 pb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <h3 className="text-emerald-400 font-semibold mb-3">Fixing the Blank Page!</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-4 text-left border border-indigo-500/50 bg-indigo-500/10 p-4 rounded-lg">
              <strong className="text-indigo-400">Found the culprit.</strong>
              <br/><br/>
              The app was showing a blank screen because I had previously enabled <strong>Strict SSL Pinning</strong> with "dummy" certificate hashes (as placeholders). This caused Android's security system to block the connection to your website, thinking it was an interception.
              <br/><br/>
              I have disabled the dummy SSL pinning in <code>network_security_config.xml</code> so your website can load normally!
              <br/><br/>
              <strong>To fix your app:</strong><br/>
              1. Download the ZIP file again using the settings menu.<br/>
              2. Extract it and override the previous files in your GitHub repository.<br/>
              3. Download the new APK once it finishes, and the blank page will be gone!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
