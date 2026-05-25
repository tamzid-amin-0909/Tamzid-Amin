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
            <h3 className="text-emerald-400 font-semibold mb-3">Fixing the Build (GitHub Outage & Missing Dependency)</h3>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto mb-4 text-left border border-amber-500/50 bg-amber-500/10 p-4 rounded-lg">
              <strong className="text-amber-400">What went wrong?</strong> GitHub's Actions matching/cache services are currently experiencing an outage, resulting in those 400 errors. Also, there was a tiny missing Android dependency (<code className="text-amber-300">lifecycle-runtime-ktx</code>).
              <br/><br/>
              I have fixed this in our source code. You have two options:
              <br/><br/>
              <strong>Option 1 (Easiest):</strong><br/>
              Download the ZIP again from the Settings Menu, extract it, and upload the newly updated files to your GitHub repository, overwriting the old ones.
              <br/><br/>
              <strong>Option 2 (Manual Edit):</strong><br/>
              <span className="text-neutral-400">1. Edit <code>android-app/app/build.gradle.kts</code> and add this inside dependencies:</span><br/>
              <code className="text-emerald-300 text-xs">implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")</code>
              <br/><br/>
              <span className="text-neutral-400">2. Edit <code>.github/workflows/android-build.yml</code> to bypass caching, suppress Node 20 warnings, and print logs:</span><br/>
              <code className="block bg-neutral-950 p-2 rounded text-[10px] sm:text-xs overflow-x-auto whitespace-pre font-mono text-emerald-300 border border-neutral-800 text-left select-all">
{`    - name: Setup Gradle
      uses: gradle/actions/setup-gradle@v4
      with:
        gradle-version: '8.7'
        cache-disabled: true

    - name: Build Debug APK
      working-directory: ./android-app
      run: gradle assembleDebug --stacktrace`}
              </code>
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
