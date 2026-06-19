import React from "react";
import { RESTAURANT_INFO, REVIEWS } from "../data";
import { Star, MessageSquareCode, Clock, Compass, PhoneCall, Check, ExternalLink } from "lucide-react";

export default function AboutSection() {
  const KITCHEN_SECERETS = [
    {
      title: "24-Hour Slow Bone Simmer",
      desc: "Our master broth boils beef bone marrow, cartilage, and short-rib structures in filtered water for over twenty-four hours to produce optimal clarity and full collagen release."
    },
    {
      title: "The Five Sacred Spice Infusions",
      desc: "We toast five organic wild Vietnamese spice pods—star anise, cassia bark, black cardamom, cloves, and whole coriander seeds—freshly grinding them into mesh herb bags for every fresh batch."
    },
    {
      title: "Phú Quốc Fish Sauce Reduction",
      desc: "We exclusively import premium, single-barrel first-press fish sauce aged on Phú Quốc island, providing rich oceanic umami that matches ancient recipes perfectly."
    }
  ];

  return (
    <div className="space-y-12">
      {/* Narrative grid row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-bold">
            Guarding Vietnamese Heritage
          </span>
          <h2 className="text-3xl font-semibold text-neutral-800 tracking-tight font-sans leading-tight">
            Crafting Harmony in Every Single Sip
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-sans">
            At <strong>Phở Harmony</strong>, we believe local dining should carry deep culinary roots. Pho isn't just soup—it's a time-honored traditional ritual, a comforting balance of deep savory marrow, delicate flat rice ribbon noodles, and vibrant, fresh garden herb accents.
          </p>
          <p className="text-sm text-neutral-500 leading-relaxed font-sans">
            Our broth maintains a transparent golden texture without any artificial additives or msg. Our herbs are sourced directly from sustainable local farms twice a day so that each leaf of holy basil and saw-leaf reaches your steaming bowl in sparkling, crisp form.
          </p>

          <div className="pt-2">
            <h4 className="font-semibold text-xs text-neutral-700 uppercase font-mono tracking-wider mb-2.5">
              Operating Hours of Our Kitchen
            </h4>
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 divide-y divide-neutral-200">
              {RESTAURANT_INFO.hours.map((hr, idx) => (
                <div key={idx} className="flex justify-between py-2 text-xs text-neutral-600 font-sans first:pt-0 last:pb-0">
                  <span className="font-medium text-neutral-800">{hr.days}</span>
                  <span className="font-mono">{hr.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual card element with list */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 lg:p-10 space-y-6 relative overflow-hidden shadow-md">
          <h3 className="text-xl font-bold font-sans tracking-tight border-b border-neutral-800 pb-4">
            The Three Secrets of Our Broth
          </h3>
          <div className="space-y-5">
            {KITCHEN_SECERETS.map((sec, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-neutral-100">{sec.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{sec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest reviews block */}
      <div className="space-y-6 border-t border-neutral-100 pt-10">
        <div className="text-center space-y-2 max-w-md mx-auto">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600">
            GUEST FEEDBACK
          </span>
          <h3 className="text-2xl font-semibold text-neutral-800 tracking-tight font-sans">
            Cherished by local Pho Enthusiasts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                {/* 5 stars */}
                <div className="flex gap-1">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 italic leading-relaxed">
                  "{rev.text}"
                </p>
              </div>

              <div className="mt-5 border-t border-neutral-50 pt-3">
                <h4 className="font-bold text-xs text-neutral-800">{rev.name}</h4>
                <p className="text-[10px] font-mono text-neutral-400">{rev.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location card bar */}
      <div className="bg-emerald-50 rounded-3xl p-6 md:p-8 border border-emerald-100 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <h4 className="font-bold text-neutral-800 text-sm">Now Offering Express Curbside Pickup</h4>
          </div>
          <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
            Order online, and specify your curbside parking spot in the special notes. We'll run your hot insulated thermals straight to your car window.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="px-5 py-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100/30 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            {RESTAURANT_INFO.phone}
          </a>
          <button
            onClick={() => {
              const el = document.getElementById("reservation-anchor-target");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Reserve Table Now
          </button>
        </div>
      </div>
    </div>
  );
}
