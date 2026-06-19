import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BUILD_YOUR_OWN_PRESETS } from "../data";
import { CustomPhoBowl } from "../types";
import { Check, Flame, Layers, Sparkles, ShoppingBag, Plus, RefreshCw, Info } from "lucide-react";

interface CustomPhoBuilderProps {
  onAddToBag: (bowl: CustomPhoBowl, instructions: string) => void;
}

export default function CustomPhoBuilder({ onAddToBag }: CustomPhoBuilderProps) {
  // Wizard state: broth, noodle, proteins, toppings, size
  const [size, setSize] = useState<"regular" | "large">("regular");
  const [selectedBroth, setSelectedBroth] = useState(BUILD_YOUR_OWN_PRESETS.broths[0].id);
  const [selectedNoodle, setSelectedNoodle] = useState(BUILD_YOUR_OWN_PRESETS.noodles[0].id);
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(["bean-sprouts", "basil", "scallion-cilantro"]);
  const [instructions, setInstructions] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  // Steps
  const [activeTab, setActiveTab] = useState<"broth" | "noodle" | "proteins" | "toppings">("broth");

  // Calculating total pricing
  const currentPrice = useMemo(() => {
    let price = size === "regular" ? 13.50 : 15.50;

    // Check noodle surcharge
    const noodleObj = BUILD_YOUR_OWN_PRESETS.noodles.find(n => n.id === selectedNoodle);
    if (noodleObj) price += noodleObj.addOn;

    // Add proteins
    selectedProteins.forEach(protId => {
      const p = BUILD_YOUR_OWN_PRESETS.proteins.find(item => item.id === protId);
      if (p) price += p.price;
    });

    // Add premium toppings
    selectedToppings.forEach(topId => {
      const t = BUILD_YOUR_OWN_PRESETS.toppings.find(item => item.id === topId);
      if (t) price += t.price;
    });

    return price;
  }, [size, selectedBroth, selectedNoodle, selectedProteins, selectedToppings]);

  // Handle toggles
  const toggleProtein = (id: string) => {
    setSelectedProteins(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSize("regular");
    setSelectedBroth(BUILD_YOUR_OWN_PRESETS.broths[0].id);
    setSelectedNoodle(BUILD_YOUR_OWN_PRESETS.noodles[0].id);
    setSelectedProteins([]);
    setSelectedToppings(["bean-sprouts", "basil", "scallion-cilantro"]);
    setInstructions("");
  };

  const handleAddToBag = () => {
    const bowlObj: CustomPhoBowl = {
      broth: selectedBroth,
      noodle: selectedNoodle,
      proteins: selectedProteins,
      toppings: selectedToppings,
      size,
      price: currentPrice
    };
    onAddToBag(bowlObj, instructions);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const activeBroth = BUILD_YOUR_OWN_PRESETS.broths.find(b => b.id === selectedBroth);
  const activeNoodle = BUILD_YOUR_OWN_PRESETS.noodles.find(n => n.id === selectedNoodle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: The Interactive Customizer Control Deck */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5 mb-6">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Interactive Atelier
            </span>
            <h2 className="text-2xl font-semibold text-neutral-800 mt-2 font-sans tracking-tight">
              Design Your Perfect Bowl
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-mono uppercase bg-neutral-50 px-3 py-1.5 rounded-md"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Design
          </button>
        </div>

        {/* 1. Size Selection Panel */}
        <div className="mb-8">
          <label className="block text-xs font-mono uppercase text-neutral-400 tracking-wider mb-3">
            Step 1: Select Your Bowl Volume
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSize("regular")}
              className={`p-4 rounded-xl border text-left transition-all ${
                size === "regular"
                  ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                  : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Regular Comfort Bowl</span>
                {size === "regular" && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
              </div>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Perfect, cozy single-portion size.</p>
              <span className="text-sm font-semibold text-neutral-800 block mt-2">$13.50 Base</span>
            </button>

            <button
              onClick={() => setSize("large")}
              className={`p-4 rounded-xl border text-left transition-all ${
                size === "large"
                  ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                  : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Large Feast Bowl</span>
                {size === "large" && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
              </div>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Extra rice noodles & deeper broth space.</p>
              <span className="text-sm font-semibold text-neutral-800 block mt-2">$15.50 Base</span>
            </button>
          </div>
        </div>

        {/* Step Tabs Grid for Ingredients */}
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase text-neutral-400 tracking-wider mb-3">
            Ingredients Builder
          </label>
          <div className="flex border-b border-neutral-100">
            {(["broth", "noodle", "proteins", "toppings"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center capitalize text-sm font-medium border-b-2 transition-all relative ${
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {tab}
                {tab === "proteins" && selectedProteins.length > 0 && (
                  <span className="absolute top-1.5 right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold scale-90">
                    {selectedProteins.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="min-h-[260px]">
          <AnimatePresence mode="wait">
            {activeTab === "broth" && (
              <motion.div
                key="broth-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <p className="text-xs text-neutral-500 mb-4">
                  The broth is the absolute soul of your pho, painstakingly simmered. Select your master broth base:
                </p>
                {BUILD_YOUR_OWN_PRESETS.broths.map(broth => (
                  <label
                    key={broth.id}
                    onClick={() => setSelectedBroth(broth.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedBroth === broth.id
                        ? "border-emerald-600 bg-emerald-50/15"
                        : "border-neutral-100 hover:border-neutral-200 bg-neutral-50/30"
                    }`}
                  >
                    <div className="mt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedBroth === broth.id ? "border-emerald-600 text-emerald-600" : "border-neutral-300"
                      }`}>
                        {selectedBroth === broth.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-neutral-800">{broth.name}</span>
                        {broth.vegan && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Vegan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{broth.description}</p>
                    </div>
                  </label>
                ))}
              </motion.div>
            )}

            {activeTab === "noodle" && (
              <motion.div
                key="noodle-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <p className="text-xs text-neutral-500 mb-4">
                  Freshness makes the difference. Hand-cut traditional rice ribbons or low-carb alternatives:
                </p>
                {BUILD_YOUR_OWN_PRESETS.noodles.map(noodle => (
                  <label
                    key={noodle.id}
                    onClick={() => setSelectedNoodle(noodle.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedNoodle === noodle.id
                        ? "border-emerald-600 bg-emerald-50/15"
                        : "border-neutral-100 hover:border-neutral-200 bg-neutral-50/30"
                    }`}
                  >
                    <div className="mt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedNoodle === noodle.id ? "border-emerald-600 text-emerald-600" : "border-neutral-300"
                      }`}>
                        {selectedNoodle === noodle.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-neutral-800">{noodle.name}</span>
                        {noodle.addOn > 0 && (
                          <span className="text-xs font-semibold text-neutral-500">
                            +${noodle.addOn.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{noodle.description}</p>
                    </div>
                  </label>
                ))}
              </motion.div>
            )}

            {activeTab === "proteins" && (
              <motion.div
                key="proteins-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                <p className="text-xs text-neutral-500 mb-2">
                  Layer your proteins. Fresh, tender cuts and proteins slow-braised to perfection (Select as many as you like):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUILD_YOUR_OWN_PRESETS.proteins.map(protein => {
                    const isSelected = selectedProteins.includes(protein.id);
                    return (
                      <button
                        key={protein.id}
                        type="button"
                        onClick={() => toggleProtein(protein.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/10 text-emerald-950"
                            : "border-neutral-100 hover:border-neutral-200 text-neutral-600 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">{protein.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-neutral-500">+${protein.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "toppings" && (
              <motion.div
                key="toppings-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                <p className="text-xs text-neutral-500 mb-2">
                  Complement the steam. Fresh herbal brightness, citrus squirts, and robust house-made sate sauces:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUILD_YOUR_OWN_PRESETS.toppings.map(topping => {
                    const isSelected = selectedToppings.includes(topping.id);
                    return (
                      <button
                        key={topping.id}
                        type="button"
                        onClick={() => toggleTopping(topping.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/10 text-emerald-950"
                            : "border-neutral-100 hover:border-neutral-200 text-neutral-600 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">{topping.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-neutral-500">
                          {topping.price > 0 ? `+$${topping.price.toFixed(2)}` : "Free"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dietary info box */}
        <div className="mt-8 bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            <strong>Allergen Warning:</strong> Our standard rice noodles are completely 100% naturally gluten-free. Vegan bone broth holds zero animal traces. Saw-leaf is highly aromatic; request herb separation if desired.
          </p>
        </div>
      </div>

      {/* RIGHT: Live Visual Bowl Rendering & Check-out Widget */}
      <div className="lg:col-span-5 space-y-6">
        {/* Dynamic SVG Pho Bowl Canvas Card */}
        <div className="bg-neutral-900 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden flex flex-col justify-between aspect-square lg:aspect-auto lg:min-h-[420px]">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 border border-zinc-700/50 px-2 py-0.5 rounded-full bg-zinc-800/40">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            LIVE BOWL ATLAS
          </div>

          <div className="absolute top-4 right-4 text-xs font-bold text-emerald-400 capitalize bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
            {size} PHO
          </div>

          <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4">
            {/* Dynamic SVG Pho Bowl representation */}
            <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-2xl">
              {/* Outer Shadow Circle */}
              <circle cx="100" cy="115" r="75" fill="black" opacity="0.25" filter="blur(6px)" />

              {/* Table Mat Plate Underlay */}
              <circle cx="100" cy="110" r="72" fill="#2d2217" stroke="#1f150d" strokeWidth="2" />
              <circle cx="100" cy="110" r="69" fill="transparent" stroke="#523924" strokeWidth="1" strokeDasharray="4,4" />

              {/* Ceramic Rice Bowl Outer Wall */}
              <circle cx="100" cy="108" r="62" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              {/* Traditional Blue Ring Motif */}
              <circle cx="100" cy="108" r="59" fill="transparent" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.8" />
              <circle cx="100" cy="108" r="57" fill="transparent" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.4" />

              {/* BROTH LIQUID INNER - Updates color dynamically */}
              <circle
                cx="100"
                cy="108"
                r="54"
                fill={
                  selectedBroth === "golden-vegan"
                    ? "#dfbd69" // vegetal herbal broth
                    : selectedBroth === "citrus-chicken"
                    ? "#e9db9f" // double-refined chicken broth
                    : "#c28f52" // classic amber 24Hr beef broth
                }
                stroke="#1f0f02"
                strokeWidth="1"
              />

              {/* Liquid specular highlights */}
              <path d="M 54 100 A 46 46 0 0 1 100 54" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.25" strokeLinecap="round" />

              {/* NOODLES REPRESENTATION - Updates based on selection */}
              <g opacity="0.85">
                {selectedNoodle === "flat-rice" ? (
                  // Traditional wide flat noodles bundles
                  <>
                    <path d="M 70 80 Q 95 90 120 75" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 60 95 Q 100 115 135 90" fill="none" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 75 110 Q 100 125 125 105" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 85 75 Q 102 110 110 135" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 68 85 Q 92 100 95 138" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                  </>
                ) : selectedNoodle === "thick-bun" ? (
                  // Thick rounded rice strings (like Spaghetti)
                  <>
                    <path d="M 65 85 Q 98 65 125 90" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 55 98 Q 102 105 130 110" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 70 115 Q 100 140 128 100" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 80 70 Q 100 125 118 128" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 72 80 Q 88 102 100 135" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
                  </>
                ) : (
                  // Elegant yellow-green julieanne Zucchini strands
                  <>
                    <path d="M 65 85 Q 98 70 125 90" fill="none" stroke="#84cc16" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 55 98 Q 102 100 130 110" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 70 115 Q 100 138 128 100" fill="none" stroke="#84cc16" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 80 70 Q 95 115 118 128" fill="none" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                    <path d="M 72 80 Q 88 102 100 135" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </g>

              {/* DYNAMIC PROTEIN GRAPHICS */}
              <g>
                {selectedProteins.includes("rare-beef") && (
                  // Beautiful light pink marbled meat folds
                  <g opacity="0.95">
                    <path d="M 70 70 C 65 60, 95 55, 90 70 C 85 80, 80 75, 70 70 Z" fill="#e11d48" stroke="#be123c" strokeWidth="0.5" />
                    <path d="M 75 62 Q 80 70 85 64" fill="none" stroke="#fda4af" strokeWidth="1.2" opacity="0.7" />
                  </g>
                )}
                {selectedProteins.includes("brisket") && (
                  // Long, rich caramelized brown slices
                  <g opacity="0.95">
                    <rect x="110" y="70" width="22" height="12" rx="3" fill="#6b5030" stroke="#451a03" strokeWidth="0.5" transform="rotate(15 110 70)" />
                    <line x1="114" y1="73" x2="128" y2="77" stroke="#b45309" strokeWidth="1" />
                  </g>
                )}
                {selectedProteins.includes("meatballs") && (
                  // Perfect spheres sliced in half with score lines
                  <g opacity="0.95">
                    {/* Meatball 1 */}
                    <circle cx="115" cy="115" r="7" fill="#78716c" stroke="#44403c" strokeWidth="0.5" />
                    <line x1="111" y1="115" x2="119" y2="115" stroke="#a8a29e" strokeWidth="0.7" />
                    <line x1="115" y1="111" x2="115" y2="119" stroke="#a8a29e" strokeWidth="0.7" />

                    {/* Meatball 2 */}
                    <circle cx="128" cy="102" r="6" fill="#78716c" stroke="#44403c" strokeWidth="0.5" />
                    <line x1="124" y1="102" x2="132" y2="102" stroke="#a8a29e" strokeWidth="0.7" />
                  </g>
                )}
                {selectedProteins.includes("chicken") && (
                  // Delicate white pulled strands elements
                  <g opacity="0.95">
                    <path d="M 90 120 Q 105 125 115 118" fill="none" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 85 125 Q 100 131 110 124" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
                {selectedProteins.includes("tofu") && (
                  // Square golden deep fried tofu pyramids
                  <g opacity="0.95">
                    <rect x="75" y="100" width="12" height="12" rx="1" fill="#d97706" stroke="#92400e" strokeWidth="1" />
                    <rect x="78" y="103" width="6" height="6" fill="#ffedd5" />
                  </g>
                )}
                {selectedProteins.includes("trumpet-mushrooms") && (
                  // Woody organic parasol stalks
                  <g opacity="0.95">
                    <path d="M 85 92 Q 95 90 92 82 C 90 77, 80 80, 85 92 Z" fill="#8c7860" />
                    <path d="M 83 80 Q 88 77 94 79" fill="none" stroke="#5c442e" strokeWidth="1" />
                  </g>
                )}
              </g>

              {/* DYNAMIC TOPPINGS GRAPHICS */}
              <g>
                {selectedToppings.includes("basil") && (
                  // Radiant oval dark-green leaves
                  <g opacity="0.95">
                    {/* Leaf 1 */}
                    <path d="M 65 110 C 55 120, 60 135, 75 125 C 80 115, 75 105, 65 110 Z" fill="#15803d" stroke="#166534" strokeWidth="0.5" />
                    <path d="M 68 114 Q 72 120 70 125" fill="none" stroke="#4ade80" strokeWidth="0.6" />

                    {/* Leaf 2 */}
                    <path d="M 115 85 C 110 75, 125 65, 130 78 C 130 90, 120 90, 115 85 Z" fill="#15803d" stroke="#166534" strokeWidth="0.5" />
                  </g>
                )}

                {selectedToppings.includes("scallion-cilantro") && (
                  // Scattered tiny circles/rings of scallions
                  <g opacity="0.9">
                    {/* Ring 1 */}
                    <circle cx="85" cy="74" r="2.5" fill="transparent" stroke="#22c55e" strokeWidth="1.5" />
                    <circle cx="85" cy="74" r="1.3" fill="#86efac" />

                    {/* Ring 2 */}
                    <circle cx="108" cy="120" r="2.5" fill="transparent" stroke="#22c55e" strokeWidth="1.5" />

                    {/* Ring 3 */}
                    <circle cx="120" cy="94" r="2" fill="transparent" stroke="#16a34a" strokeWidth="1" />

                    {/* Coriander leaf */}
                    <path d="M 102 78 Q 106 82 102 86 Q 98 82 102 78 Z" fill="#22c55e" />
                    <path d="M 103 82 Q 108 81 109 84" fill="none" stroke="#16a34a" strokeWidth="0.5" />
                  </g>
                )}

                {selectedToppings.includes("jalapeno") && (
                  // Light green sliced medallions with seed points
                  <g opacity="0.95">
                    {/* Slice 1 */}
                    <circle cx="95" cy="95" r="5" fill="#4ade80" stroke="#166534" strokeWidth="0.7" />
                    <circle cx="95" cy="95" r="3.2" fill="#bbf7d0" />
                    <circle cx="93.8" cy="95" r="0.7" fill="#fef08a" />
                    <circle cx="96" cy="94" r="0.7" fill="#fef08a" />

                    {/* Slice 2 */}
                    <circle cx="105" cy="108" r="4.5" fill="#4ade80" stroke="#166534" strokeWidth="0.7" />
                    <circle cx="105" cy="108" r="2.8" fill="#bbf7d0" />
                  </g>
                )}

                {selectedToppings.includes("onion") && (
                  // Translucent moon crescent shapes
                  <g opacity="0.75">
                    <path d="M 68 85 A 25 25 0 0 1 85 105 A 22 22 0 0 0 71 88" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.4" />
                    <path d="M 85 125 A 30 30 0 0 1 100 135" fill="none" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                )}

                {selectedToppings.includes("chili-oil") && (
                  // Red fiery drops/droplets swirling around the bowl
                  <g opacity="0.9">
                    <circle cx="98" cy="85" r="2" fill="#ef4444" opacity="0.8" />
                    <circle cx="104" cy="88" r="1.3" fill="#f97316" />
                    <path d="M 72 102 Q 80 108 84 105" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 112 112 Q 115 125 120 120" fill="none" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" />
                  </g>
                )}

                {selectedToppings.includes("poached-egg") && (
                  // Beautiful soft cooked egg with orange jelly ooze
                  <g opacity="0.95">
                    <path d="M 94 95 C 88 95, 84 102, 88 107 C 92 112, 102 110, 100 102 C 98 94, 98 95, 94 95 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                    <circle cx="92" cy="102" r="4.5" fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />
                    <circle cx="90.5" cy="100.5" r="1.2" fill="#ffffff" opacity="0.6" />
                  </g>
                )}

                {selectedToppings.includes("bean-sprouts") && (
                  // White curved delicate bean shoots with yellow tip heads
                  <g opacity="0.9">
                    <path d="M 64 88 Q 58 84 54 90" fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="53" cy="91" r="1" fill="#facc15" />

                    <path d="M 125 80 Q 132 82 134 76" fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="135" cy="75" r="1" fill="#eab308" />
                  </g>
                )}
              </g>

              {/* Fresh Lime Wedge Resting on the mat outside the rim */}
              <g transform="rotate(-15 48 140)">
                <path d="M 40 140 A 10 10 0 0 1 50 150 Z" fill="#22c55e" />
                <path d="M 42 141 A 8 8 0 0 1 49 148 Z" fill="#86efac" />
              </g>
            </svg>
          </div>

          <div className="border-t border-zinc-800 pt-4 text-left">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 block uppercase">
              Current Build Summary
            </span>
            <div className="flex justify-between items-baseline mt-1">
              <h3 className="font-medium text-lg leading-tight capitalize text-neutral-100">
                Custom {size} Pho
              </h3>
              <span className="text-xl font-bold text-emerald-400 font-sans">
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
              Broth: <span className="text-zinc-200">{activeBroth?.name}</span> • Noodle: <span className="text-zinc-200">{activeNoodle?.name}</span>
              {selectedProteins.length > 0 && (
                <> • Proteins: <span className="text-orange-300">
                  {selectedProteins.map(p => BUILD_YOUR_OWN_PRESETS.proteins.find(item => item.id === p)?.name.split(" (")[0]).join(", ")}
                </span></>
              )}
            </p>
          </div>
        </div>

        {/* Pricing Card Controls and Bag Add */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 tracking-wider mb-2">
              Chef Instructions & Special Requests
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Separated bean sprouts, extra chili oil on the side..."
              className="w-full text-sm px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50"
            />
          </div>

          <button
            onClick={handleAddToBag}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Add Custom Bowl to Bag (${currentPrice.toFixed(2)})
          </button>

          <AnimatePresence>
            {addedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2.5 rounded-lg border border-emerald-100 text-center flex items-center justify-center gap-2 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Custom Pho perfectly added to your shopping bag!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
