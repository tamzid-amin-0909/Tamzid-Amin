import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";
import { X, Trash2, ShoppingBag, CreditCard, Sparkles, AlertCircle, Clock, ChefHat } from "lucide-react";
import { BUILD_YOUR_OWN_PRESETS } from "../data";

interface ShoppingCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isOpen,
  onClose,
}: ShoppingCartProps) {
  const [orderMode, setOrderMode] = useState<"pickup" | "delivery">("pickup");
  const [tipRate, setTipRate] = useState<number>(18); // default 18%
  const [customTip, setCustomTip] = useState<string>("");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "success">("cart");

  // Delivery details form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pricing computations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const tax = useMemo(() => subtotal * 0.085, [subtotal]); // 8.5% SF tax

  const activeTip = useMemo(() => {
    if (tipRate === -1) {
      return parseFloat(customTip) || 0;
    }
    return subtotal * (tipRate / 100);
  }, [subtotal, tipRate, customTip]);

  const deliveryFee = orderMode === "delivery" ? 3.99 : 0;
  const serviceFee = subtotal > 0 ? 1.50 : 0;

  const total = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal + tax + activeTip + deliveryFee + serviceFee;
  }, [subtotal, tax, activeTip, deliveryFee, serviceFee]);

  const handleApplyTip = (rate: number) => {
    setTipRate(rate);
    setCustomTip("");
  };

  const handleCustomTipChange = (val: string) => {
    setTipRate(-1);
    setCustomTip(val);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.name = "Your name is required";
    if (!customerPhone.trim()) {
      errors.phone = "Phone number is required";
    } else if (customerPhone.replace(/[^0-9]/g, "").length < 10) {
      errors.phone = "Phone is too short";
    }

    if (orderMode === "delivery" && !customerAddress.trim()) {
      errors.address = "An address is required for deliveries";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setCheckoutStep("success");
  };

  const handleOrderDone = () => {
    onClearCart();
    setCheckoutStep("cart");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setFormErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[999]"
          />

          {/* Cart Sidebar content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-neutral-100 shadow-2xl z-[1000] flex flex-col justify-between"
          >
            {/* Header Block */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-neutral-800 tracking-tight">
                  {checkoutStep === "success" ? "Order Cooking!" : "Your Noodle Bag"}
                </h2>
                {cartItems.length > 0 && checkoutStep !== "success" && (
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                    {cartItems.reduce((acc, x) => acc + x.quantity, 0)} items
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Body Scroll block */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutStep === "cart" && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-20 px-4 space-y-4 text-neutral-400">
                      <ShoppingBag className="w-12 h-12 stroke-[1.2] text-neutral-300 mx-auto" />
                      <h3 className="font-semibold text-neutral-700 text-sm">Your bag is empty</h3>
                      <p className="text-xs text-neutral-400 max-w-[240px] mx-auto leading-relaxed">
                        Select deep simmering bone broth sets, spring rolls, and authentic drinks on the menu to begin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Delivery/Pickup toggle */}
                      <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setOrderMode("pickup")}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            orderMode === "pickup"
                              ? "bg-white text-emerald-950 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          Express Pickup (Free)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderMode("delivery")}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            orderMode === "delivery"
                              ? "bg-white text-emerald-950 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          Local Delivery ($3.99)
                        </button>
                      </div>

                      {/* Noodle Bag list of items */}
                      <div className="space-y-3 divide-y divide-neutral-100">
                        {cartItems.map((item, idx) => {
                          const isCustom = !!item.customBowl;
                          return (
                            <div key={item.id} className={`flex gap-4 pt-3 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                              {/* Thumbnail preview */}
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-150 shrink-0 border border-neutral-100">
                                {isCustom ? (
                                  <div className="w-full h-full bg-emerald-950 flex flex-col items-center justify-center text-[9px] font-mono font-bold text-white leading-tight p-1">
                                    <ChefHat className="w-4 h-4 text-emerald-400 mb-0.5" />
                                    CUSTOM
                                  </div>
                                ) : (
                                  <img
                                    src={item.menuItem?.image}
                                    alt={item.menuItem?.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="text-xs font-bold text-neutral-800 font-sans leading-tight">
                                    {isCustom ? `Custom ${item.customBowl?.size} Pho Bowl` : item.menuItem?.name}
                                  </h4>
                                  <span className="text-xs font-bold text-neutral-900 shrink-0">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>

                                {/* Builder details description details */}
                                {isCustom && item.customBowl && (
                                  <div className="text-[10px] text-neutral-500 leading-normal space-y-0.5 mt-1">
                                    <p>
                                      Broth: <span className="font-semibold text-neutral-700">
                                        {BUILD_YOUR_OWN_PRESETS.broths.find(b => b.id === item.customBowl?.broth)?.name.split(" (")[0]}
                                      </span>
                                    </p>
                                    <p>
                                      Noodle: <span className="font-semibold text-neutral-700">
                                        {BUILD_YOUR_OWN_PRESETS.noodles.find(n => n.id === item.customBowl?.noodle)?.name.split(" (")[0]}
                                      </span>
                                    </p>
                                    {item.customBowl.proteins.length > 0 && (
                                      <p>
                                        Meat/Tofu: <span className="text-neutral-700 font-medium">
                                          {item.customBowl.proteins.map(p => BUILD_YOUR_OWN_PRESETS.proteins.find(it => it.id === p)?.name.split(" (")[0]).join(", ")}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Special instructions snippet */}
                                {item.specialInstructions && (
                                  <div className="text-[10px] bg-neutral-50 text-neutral-600 px-2 py-1 rounded font-mono leading-relaxed mt-1 flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                                    <span className="break-all">Note: {item.specialInstructions}</span>
                                  </div>
                                )}

                                {/* Card footer tools: incrementer & delete */}
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center border border-neutral-200 rounded-lg scale-90 -ml-1">
                                    <button
                                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 flex items-center justify-center text-xs text-neutral-500 hover:bg-neutral-50"
                                    >
                                      –
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-bold font-mono">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 flex items-center justify-center text-xs text-neutral-500 hover:bg-neutral-50"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Exclude item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Gratitude / Tipping engine */}
                      <div className="border-t border-neutral-100 pt-4 space-y-2">
                        <label className="block text-xs font-semibold text-neutral-600">
                          Appreciate Our Broth Chefs (Gratitude Tip)
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[15, 18, 20].map(tipPercent => (
                            <button
                              key={tipPercent}
                              onClick={() => handleApplyTip(tipPercent)}
                              className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                                tipRate === tipPercent
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                              }`}
                            >
                              {tipPercent}% (${(subtotal * (tipPercent / 100)).toFixed(2)})
                            </button>
                          ))}
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Custom $"
                            value={customTip}
                            onChange={(e) => handleCustomTipChange(e.target.value)}
                            className={`px-2 py-2 text-[11px] font-semibold text-center rounded-xl border focus:outline-none ${
                              tipRate === -1 ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-neutral-200"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === "address" && (
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-600 tracking-wider">
                      CHECKOUT PORTAL
                    </span>
                    <h3 className="text-xl font-bold text-neutral-800 tracking-tight">
                      Express {orderMode === "pickup" ? "Pickup" : "Delivery"} Detail
                    </h3>
                    <p className="text-xs text-neutral-500">
                      We never request complex bank credentials. Settle your charge on-site upon receipt. Fully contact-free.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-600">Your Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Lan Anh Nguyen"
                        className={`w-full text-sm px-4.5 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                          formErrors.name ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                        }`}
                      />
                      {formErrors.name && <p className="text-xs text-rose-600 font-medium">{formErrors.name}</p>}
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-600">Mobile Number (For Courier update)</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="415-555-0192"
                        className={`w-full text-sm px-4.5 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                          formErrors.phone ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                        }`}
                      />
                      {formErrors.phone && <p className="text-xs text-rose-600 font-medium">{formErrors.phone}</p>}
                    </div>

                    {/* Delivery Address (only block if Mode is Delivery) */}
                    {orderMode === "delivery" && (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-neutral-600">Delivery Address</label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="832 Valencia St, San Francisco, CA 94110"
                          className={`w-full text-sm px-4.5 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                            formErrors.address ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                          }`}
                        />
                        {formErrors.address && <p className="text-xs text-rose-600 font-medium">{formErrors.address}</p>}
                      </div>
                    )}
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-500 leading-normal">
                      {orderMode === "pickup"
                        ? "Your fresh bowl of pho and accessories will be prepared and packed inside steam-proof thermals, ready in under 15 minutes."
                        : "Estimated delivery coordinate duration: 25-35 minutes depending on courier availability near Valencia St."}
                    </p>
                  </div>
                </form>
              )}

              {checkoutStep === "success" && (
                <div className="text-center py-6 px-2 space-y-6">
                  {/* Glowing dynamic chef hat icon */}
                  <div className="relative w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <ChefHat className="w-8 h-8 stroke-[1.5]" />
                    <span className="absolute -top-1 -right-1 bg-rose-500 w-3 h-3 rounded-full animate-ping" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                      Pot is Boiling
                    </span>
                    <h3 className="text-xl font-bold text-neutral-800 tracking-tight pt-1">
                      Our Broth Master is pouring!
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                      Thank you for dining with Phở Harmony. Prepare to indulge in steaming authentic herbal comfort!
                    </p>
                  </div>

                  {/* Progressive Cooking Tracker flow widget */}
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-left space-y-4">
                    <div className="text-[10px] font-mono text-neutral-400 border-b border-neutral-200 pb-2">
                      ESTIMATED READY: {orderMode === "pickup" ? "15 MINS" : "30 MINS"}
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Step 1 CONFIRMED */}
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-800">Order Confirmed</p>
                          <p className="text-[10px] text-neutral-400 leading-tight">Received in kitchen, preparing side dishes.</p>
                        </div>
                      </div>

                      {/* Step 2 PREPARING (Boiling) */}
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold animate-pulse">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-medium text-emerald-800">Stock Simmering & Plating</p>
                          <p className="text-[10px] text-zinc-500 leading-tight">LADLING steaming 24-hr marrow broth over fresh rice noodles.</p>
                        </div>
                      </div>

                      {/* Step 3 Packaging */}
                      <div className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-neutral-250 text-neutral-500 flex items-center justify-center text-[10px] font-medium">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-medium text-neutral-800">Sealing in Thermals</p>
                          <p className="text-[10px] text-neutral-500 leading-tight">Securing separation herbs dynamically in thermal carriers.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOrderDone}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-3 rounded-xl text-xs transition-all shadow cursor-pointer"
                  >
                    Return to Shop Menu
                  </button>
                </div>
              )}
            </div>

            {/* Core Footer Block (Totals & Action Triggers) */}
            {checkoutStep !== "success" && cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4 shrink-0">
                <div className="space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  {orderMode === "delivery" && (
                    <div className="flex justify-between">
                      <span>Courier Delivery Fee</span>
                      <span className="font-mono">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Local Sales Tax & Surcharge (8.5%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging & Bio-Box Service Fee</span>
                    <span className="font-mono">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Gratitude Tip</span>
                    <span className="font-mono">${activeTip.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-neutral-800 pt-2 border-t border-neutral-200">
                    <span>Grand Total</span>
                    <span className="font-mono text-emerald-850 text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutStep === "cart" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep("address");
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    Proceed to Order Detail
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="flex-1 border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      form="checkout-form"
                      className="flex-[2] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Place Order Cash on Receipt
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
