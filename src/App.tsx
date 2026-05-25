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
          <div className="grid gap-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-700/50">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-200 mb-1">Hard SSL Pinning</h3>
                <p className="text-sm text-neutral-400">Strict certificate pinning configured via Network Security Config and OkHttp.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-700/50">
              <Code className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-200 mb-1">Modern Architecture</h3>
                <p className="text-sm text-neutral-400">Kotlin Coroutines, ViewBinding, and Material 3 design are fully integrated.</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <h3 className="text-emerald-400 font-semibold mb-3">Fixing the Kotlin Compilation Error!</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-4 text-left border border-indigo-500/50 bg-indigo-500/10 p-4 rounded-lg">
              <strong className="text-indigo-400">Ah, a strict Kotlin compiler error!</strong>
              <br/><br/>
              The issue was hiding inside the custom Web Clients. Modern Android requires strict non-null definitions for things like the <code>WebView</code> and URLs, but I had originally included some optional nullability (<code>?</code>) which clashed with the SDK, causing it to fail right at the end.
              <br/><br/>
              I have removed the optional nullability to guarantee a strict match for Android API 34.
              <br/><br/>
              <strong>To build your APK:</strong><br/>
              1. Download the ZIP file again using the settings menu.<br/>
              2. Extract it and override the previous files in your GitHub repository.<br/>
              3. The build should now sail through smoothly past the compiler.
            </p>
            
            <h3 className="text-emerald-400 font-semibold mb-3 mt-6">Did it actually fail with a red "X"?</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-2 text-left">
              If there is a red "X" next to "Build Debug APK", click on it to expand the terminal and scroll down until you see <strong>FAILED</strong> or <strong>* What went wrong</strong>. Copy that exact error message!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
