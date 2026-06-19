import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, CartItem, CustomPhoBowl } from "./types";
import { RESTAURANT_INFO, BUILD_YOUR_OWN_PRESETS } from "./data";

// Component imports
import MenuSection from "./components/MenuSection";
import CustomPhoBuilder from "./components/CustomPhoBuilder";
import ReservationForm from "./components/ReservationForm";
import ShoppingCart from "./components/ShoppingCart";
import AboutSection from "./components/AboutSection";

import { ShoppingBag, ChevronRight, Phone, Clock, MapPin, ChefHat, BookOpen, Soup, CalendarRange, Star } from "lucide-react";
const phoHero = "/src/assets/images/pho_hero_banner_1779818126548.png";

export default function App() {
  const [activeSection, setActiveSection] = useState<"menu" | "custom" | "reservations" | "about">("menu");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart operations managers
  const handleAddToBag = (item: MenuItem, quantity: number, specialInstructions: string) => {
    setCartItems(prev => {
      // Unique signature based on itemId and spec instructions
      const cartId = `${item.id}-${specialInstructions.replace(/\s/g, "")}`;
      const existing = prev.find(x => x.id === cartId);

      if (existing) {
        return prev.map(x => (x.id === cartId ? { ...x, quantity: x.quantity + quantity } : x));
      }

      return [
        ...prev,
        {
          id: cartId,
          menuItem: item,
          quantity,
          specialInstructions,
          price: item.price
        }
      ];
    });
  };

  const handleCustomAddToBag = (bowl: CustomPhoBowl, specialInstructions: string) => {
    setCartItems(prev => {
      // Build details signature for caching duplicates
      const signature = `${bowl.broth}-${bowl.noodle}-${bowl.proteins.join("")}-${bowl.toppings.join("")}-${specialInstructions.replace(/\s/g, "")}`;
      const cartId = `custom-${signature}`;
      const existing = prev.find(x => x.id === cartId);

      if (existing) {
        return prev.map(x => (x.id === cartId ? { ...x, quantity: x.quantity + 1 } : x));
      }

      return [
        ...prev,
        {
          id: cartId,
          customBowl: bowl,
          quantity: 1,
          specialInstructions,
          price: bowl.price
        }
      ];
    });
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => prev.map(x => (x.id === id ? { ...x, quantity: newQty } : x)));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(x => x.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Cart quantity count
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, current) => acc + current.quantity, 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* GLOBAL SHOPPING CONTAINER SIDEBAR */}
      <ShoppingCart
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* TOP ANNOUNCEMENT NOTIFIER BAR */}
      <div className="bg-emerald-950 text-emerald-100/90 text-[11px] font-mono py-2 px-4 flex justify-between items-center tracking-wider max-w-full">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            LIVE CURBSIDE PICKUP AVAILABLE
          </span>
          <span className="hidden md:inline text-neutral-400">|</span>
          <span className="hidden md:inline flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {RESTAURANT_INFO.address}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" />
            {RESTAURANT_INFO.phone}
          </span>
        </div>
      </div>

      {/* COMPACT FLOATING HEADER NAV */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-neutral-100 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          
          {/* Logo Brand Segment */}
          <button
            onClick={() => {
              setActiveSection("menu");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-800/10 transition-transform group-hover:scale-105">
              <Soup className="w-5 h-5 text-emerald-100 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-800 font-sans leading-none">
                {RESTAURANT_INFO.name}
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-emerald-600 uppercase font-bold leading-normal">
                Slow-Simmered Soul
              </span>
            </div>
          </button>

          {/* Navigation Links Grid */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/60 p-1 rounded-xl border border-neutral-200/30">
            {[
              { id: "menu", label: "Menu Catalog", icon: BookOpen },
              { id: "custom", label: "Build Your Bowl", icon: ChefHat },
              { id: "reservations", label: "Book Table", icon: CalendarRange },
              { id: "about", label: "Our Secret Story", icon: Star },
            ].map(link => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveSection(link.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-700" : "text-neutral-400"}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Bag button with Count notifier */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow shadow-emerald-700/10 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline font-semibold">My Noodle Bag</span>
            {cartCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold animate-bounce shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* IMMERSIVE HERO SPLASH AREA */}
      <div className="relative bg-neutral-900 text-white overflow-hidden py-16 md:py-24">
        {/* Absolute Background generated beautiful image */}
        <div className="absolute inset-0">
          <img
            src={phoHero}
            alt="Authentic boiling pho banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/90 to-neutral-800/20" />
        </div>

        {/* Hero Copy Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800/40">
              {RESTAURANT_INFO.tagline}
            </span>
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] font-sans text-neutral-100">
                A Clear Golden Golden Broth simmered for over <span className="text-emerald-400 underline decoration-wavy decoration-emerald-600">24 hours</span>.
              </h2>
              <p className="text-sm md:text-base text-neutral-400 font-sans max-w-xl leading-relaxed">
                Enjoy rich, comforting bone collagen stock seasoned with key star anise, toasted cassia bark, charred organic ginger, and authentic wild saw-leaf accents.
              </p>
            </div>

            {/* Quick Action deck */}
            <div className="pt-3 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setActiveSection("custom");
                  const target = document.getElementById("main-interactive-block");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-700/25 flex items-center gap-1.5 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 stroke-[2]" />
                Interactive Noodle Builder
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setActiveSection("menu");
                  const target = document.getElementById("main-interactive-block");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Browse Our Menu Catalog
              </button>
            </div>
          </div>

          {/* Quick Info Deck */}
          <div className="md:col-span-4 bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-5 space-y-4 text-xs">
            <h4 className="font-mono text-emerald-400 tracking-wider uppercase font-bold text-[10px]">
              QUICK ADORE HOURS
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                <span className="text-neutral-400">Weekly Lunch & Dinner</span>
                <span className="font-mono text-neutral-200">11:00 AM – 9:30 PM</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                <span className="text-neutral-400">Weekend Gatherings</span>
                <span className="font-mono text-neutral-200">11:00 AM – 10:30 PM</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                <span className="text-neutral-400">Phone Hotline</span>
                <span className="font-mono text-emerald-400 font-semibold">{RESTAURANT_INFO.phone}</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 leading-normal">
              Located on vibrant Valencia street. Limited street parking. Double-bag secure takeout container protocols observed.
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV BAR FILTER SYSTEM */}
      <div className="md:hidden bg-white border-b border-neutral-100 flex p-1.5 overflow-x-auto gap-1">
        {[
          { id: "menu", label: "Catalog Menu" },
          { id: "custom", label: "Build Your Pho" },
          { id: "reservations", label: "Table RSVP" },
          { id: "about", label: "About Us" },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={`px-4 py-2 font-semibold text-xs whitespace-nowrap rounded-lg transition-all ${
              activeSection === item.id
                ? "bg-emerald-700 text-white"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CORE ACTIVE MODULE SECTION TARGET CONTAINER */}
      <main id="main-interactive-block" className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex-grow w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeSection === "menu" && (
              <MenuSection onAddToBag={handleAddToBag} />
            )}

            {activeSection === "custom" && (
              <CustomPhoBuilder onAddToBag={handleCustomAddToBag} />
            )}

            {activeSection === "reservations" && (
              <div id="reservation-anchor-target">
                <ReservationForm />
              </div>
            )}

            {activeSection === "about" && (
              <AboutSection />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* HUMAN-CENTERED SYSTEM FOOTER */}
      <footer className="bg-neutral-900 border-t border-neutral-800 text-zinc-400 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                🍜
              </div>
              <h4 className="font-bold font-sans tracking-tight text-[13px]">{RESTAURANT_INFO.name}</h4>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans pr-4">
              Honoring generations of slow-broth makers from Hanoi to Saigon. Every single ingredients container undergoes pristine, hygiene-safe checks.
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">
              © {new Date().getFullYear()} Phở Harmony Co. All rights reserved. Registered trademark.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h5 className="font-mono text-zinc-300 uppercase tracking-widest text-[10px] font-bold">
              Coordinates
            </h5>
            <div className="space-y-2 leading-relaxed">
              <p className="text-neutral-300 font-medium">{RESTAURANT_INFO.address}</p>
              <p className="text-zinc-500">Pickup desk at front bar vestibule.</p>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h5 className="font-mono text-zinc-300 uppercase tracking-widest text-[10px] font-bold">
              Connect Channels
            </h5>
            <div className="space-y-1">
              <p>Hotline: <span className="text-emerald-400 font-semibold">{RESTAURANT_INFO.phone}</span></p>
              <p>Mail: <span className="text-neutral-300">{RESTAURANT_INFO.email}</span></p>
              <p className="text-zinc-500 pt-1 text-[10.5px]">Accepting digital passes & cache.</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="font-mono text-zinc-300 uppercase tracking-widest text-[10px] font-bold">
              Our Values
            </h5>
            <ul className="space-y-1 text-zinc-500 leading-normal">
              <li>• Pure grass-fed bone marrow</li>
              <li>• Scented cardamom spices</li>
              <li>• 100% Gluten-free rice threads</li>
              <li>• Hand-sliced eye-round steaks</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
