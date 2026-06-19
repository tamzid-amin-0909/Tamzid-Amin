import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MENU_ITEMS } from "../data";
import { MenuItem } from "../types";
import { Search, Filter, ShoppingCart, Plus, Check, Star, Leaf } from "lucide-react";

interface MenuSectionProps {
  onAddToBag: (item: MenuItem, quantity: number, specialInstructions: string) => void;
}

export default function MenuSection({ onAddToBag }: MenuSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "appetizer" | "pho" | "beverage" | "dessert">("all");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [showItemNotesId, setShowItemNotesId] = useState<string | null>(null);
  const [itemInstructions, setItemInstructions] = useState("");
  const [addedItemNotifications, setAddedItemNotifications] = useState<Record<string, boolean>>({});

  // Dietary tags list
  const DIETARY_LABELS = [
    { id: "gluten-free", name: "Gluten-Free", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { id: "vegan", name: "100% Vegan", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { id: "vegetarian", name: "Vegetarian", color: "bg-teal-100 text-teal-800 border-teal-200" },
    { id: "spicy", name: "Spicy Accents", color: "bg-rose-100 text-rose-800 border-rose-200" },
  ];

  // Categories list
  const CATEGORIES = [
    { id: "all", name: "Everything" },
    { id: "appetizer", name: "Small Bites (Khai Vị)" },
    { id: "pho", name: "Broth Bowls (Phở)" },
    { id: "beverage", name: "Craft Drinks (Giải Khát)" },
    { id: "dessert", name: "Sweet Treats" },
  ] as const;

  // Track quantites locally per card
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (itemId: string, direction: "inc" | "dec") => {
    setQuantities(prev => {
      const current = prev[itemId] || 1;
      const next = direction === "inc" ? current + 1 : Math.max(1, current - 1);
      return { ...prev, [itemId]: next };
    });
  };

  const toggleDietaryFilter = (id: string) => {
    setSelectedDietary(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered menu logic
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      // 1. Category Filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // 2. Dietary Filter
      if (selectedDietary.length > 0) {
        if (!item.dietary) return false;
        const matchesAllSelected = selectedDietary.every(tag => item.dietary?.includes(tag as any));
        if (!matchesAllSelected) return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [selectedCategory, selectedDietary, searchQuery]);

  const handleAddClick = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    onAddToBag(item, qty, itemInstructions);
    setItemInstructions("");
    setShowItemNotesId(null);

    // Flash success checkmark notification
    setAddedItemNotifications(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemNotifications(prev => ({ ...prev, [item.id]: false }));
    }, 2500);

    // Reset quantities count back to 1
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter deck bar */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-neutral-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. eye-round, spring rolls, sugarcane...)"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50"
            />
          </div>

          {/* Categories Tab selectors */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Tag Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-50">
          <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 uppercase tracking-wider mr-2">
            <Filter className="w-3 h-3" />
            Lifestyles:
          </span>
          {DIETARY_LABELS.map(tag => {
            const isSelected = selectedDietary.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleDietaryFilter(tag.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-850 hover:bg-emerald-900 text-white border-emerald-900"
                    : "bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                {tag.name}
              </button>
            );
          })}

          {(selectedDietary.length > 0 || searchQuery !== "" || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSelectedDietary([]);
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-neutral-400 hover:text-emerald-700 font-mono underline ml-auto cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <AnimatePresence mode="popLayout">
        {filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenuItems.map(item => {
              const qty = quantities[item.id] || 1;
              const hasNotes = showItemNotesId === item.id;
              const showCheckmark = addedItemNotifications[item.id];

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  id={`menu-card-${item.id}`}
                  className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm flex flex-col justify-between group"
                >
                  {/* Top-Half card block */}
                  <div className="relative">
                    {/* Visual Asset Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {/* Popular ribbon */}
                      {item.popular && (
                        <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono uppercase font-black text-[9px] tracking-widest px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          POPULAR Choice
                        </div>
                      )}

                      {/* Dietary indicators */}
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          {item.dietary.includes("vegan") && (
                            <div className="bg-emerald-600 text-white p-1 rounded-full shadow" title="Vegan-friendly">
                              <Leaf className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content block */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg text-neutral-800 tracking-tight leading-snug font-sans">
                          {item.name}
                        </h3>
                        <span className="font-bold text-lg text-emerald-800 shrink-0">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 leading-relaxed font-sans line-clamp-3">
                        {item.description}
                      </p>

                      {/* Dietary micro-tags */}
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.dietary.map(tag => {
                            const details = DIETARY_LABELS.find(l => l.id === tag);
                            return (
                              <span
                                key={tag}
                                className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                                  details?.color || "bg-neutral-50 text-neutral-500"
                                }`}
                              >
                                {details?.name || tag}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Bottom Controls block */}
                  <div className="p-5 pt-0 border-t border-neutral-50 bg-neutral-50/[0.2] space-y-3">
                    {/* Toggleable Chef Instructions Input */}
                    <AnimatePresence>
                      {hasNotes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden pt-3"
                        >
                          <input
                            type="text"
                            value={itemInstructions}
                            onChange={(e) => setItemInstructions(e.target.value)}
                            placeholder="Allergies, preferences, separated broth..."
                            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quantity controls and main trigger btn */}
                    <div className="flex items-center gap-3 pt-3">
                      {/* Quantity decrementer and incrementer */}
                      <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-inner overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, "dec")}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-colors"
                        >
                          –
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-neutral-800 font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, "inc")}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold stroke-[3] text-neutral-500 hover:bg-neutral-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Customize / Notes option */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowItemNotesId(hasNotes ? null : item.id);
                          if (hasNotes) setItemInstructions("");
                        }}
                        className={`text-xs font-mono tracking-wide px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                          hasNotes
                            ? "bg-slate-100 text-slate-800 border-slate-200"
                            : "bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-200"
                        }`}
                      >
                        {hasNotes ? "Cancel Special" : "Special Request"}
                      </button>

                      {/* Add directly to bag */}
                      <button
                        type="button"
                        onClick={() => handleAddClick(item)}
                        disabled={showCheckmark}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all outline-none ${
                          showCheckmark
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                        }`}
                      >
                        {showCheckmark ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            Perfectly Added!
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            Add to Bag
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-3xl p-12 text-center text-neutral-400 space-y-3">
            <Search className="w-8 h-8 stroke-[1.5] text-neutral-300 mx-auto" />
            <p className="font-semibold text-neutral-700 text-sm">No matches found</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              We couldn't fine any options matching your active lifestyle or query. Try adjusting your query or resetting the filter tags!
            </p>
            <button
              onClick={() => {
                setSelectedDietary([]);
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-4 py-2 mt-4 rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
