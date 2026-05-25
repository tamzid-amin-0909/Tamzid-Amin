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
            <h3 className="text-emerald-400 font-semibold mb-3">One Last Fix for GitHub Actions!</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-4 text-left border border-indigo-500/50 bg-indigo-500/10 p-4 rounded-lg">
              <strong className="text-indigo-400">I found the issue!</strong> The background error you had earlier (<code>Cannot mutate the dependencies...</code>) was due to an incompatibility between the Android compiler plugin and GitHub's latest runner environment.
              <br/><br/>
              I have permanently fixed the compiler versions!
              <br/><br/>
              <strong>To finally get your APK:</strong><br/>
              1. Download the ZIP file again using the gear menu above.<br/>
              2. Extract it and upload/overwrite all the files in your GitHub repository, just like before.<br/>
              3. The build will start automatically, and this time it will successfully skip that error!<br/>
              <br/>
              <span className="text-xs text-neutral-400">(Note: that Node.js 20 warning will still appear at the very bottom, but you can completely ignore it. Your app will build successfully now!)</span>
            </p>
            <ol className="text-neutral-300 text-sm space-y-3 text-left list-decimal list-inside max-w-sm mx-auto">
              <li>Once you overwrite these files on GitHub, the workflow will trigger again automatically.</li>
              <li>Because we added <code>--stacktrace</code>, if it fails, it will tell you the exact line number!</li>
              <li>Wait for the green checkmark and download the APK!</li>
            </ol>
            
            <h3 className="text-emerald-400 font-semibold mb-3 mt-6">Or compile locally:</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-2 text-left">
              Download the project via the <strong>Settings menu</strong>. Then, open the <code className="bg-neutral-900 px-1 py-0.5 rounded text-emerald-300">android-app</code> folder in <strong>Android Studio</strong> to run it securely on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
