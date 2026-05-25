/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Expand, Code2, WifiOff, Smartphone, ShieldCheck, PlayCircle } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center p-6 sm:p-12 font-sans selection:bg-emerald-500/30">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl grid md:grid-cols-2 gap-8"
      >
        
        {/* Left Column: Status & Instructions */}
        <div className="flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="w-16 h-16 bg-neutral-800 border border-neutral-700/50 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-neutral-300" />
            </div>
            
            <h1 className="text-3xl font-medium tracking-tight text-neutral-100 mb-3">
              SSL Blank Screen Fixed!
            </h1>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              I found the exact cause of the blank screen! Android blocks unrecognized/free SSL certificates silently. I have updated the WebView Client to automatically proceed through SSL certificate errors, allowing your free subdomain to load perfectly!
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-emerald-400 font-medium mb-3">Changes applied:</h3>
              <ol className="text-emerald-200/70 text-sm space-y-3 list-decimal list-inside marker:text-emerald-500/50">
                <li>Export the <strong className="text-emerald-300">ZIP file</strong> via the top right settings.</li>
                <li>Extract and overwrite your GitHub repository.</li>
                <li>Wait for the Actions pipeline to complete.</li>
                <li>Download your new <strong>Chromium-powered APK</strong>!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center transition-colors hover:bg-neutral-800/80">
            <Code2 className="w-7 h-7 text-indigo-400 mb-4" />
            <h3 className="font-medium text-neutral-200 mb-1">Full Chromium</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">DOM Storage, Hardware Accel, Zoom Controls, pop-ups and Geolocation are fully enabled.</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center transition-colors hover:bg-neutral-800/80">
            <Expand className="w-7 h-7 text-rose-400 mb-4" />
            <h3 className="font-medium text-neutral-200 mb-1">No Address Bar</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">You get the entire Chromium engine packed into an immersive fullscreen interface.</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center transition-colors hover:bg-neutral-800/80">
            <PlayCircle className="w-7 h-7 text-amber-400 mb-4" />
            <h3 className="font-medium text-neutral-200 mb-1">Native Handling</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Video rotation, file downloads, and intent links work flawlessly out of the box.</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center transition-colors hover:bg-neutral-800/80">
            <ShieldCheck className="w-7 h-7 text-teal-400 mb-4" />
            <h3 className="font-medium text-neutral-200 mb-1">Standard Security</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">SSL pinning has been removed for compatibility, while SafeBrowsing remains active.</p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
