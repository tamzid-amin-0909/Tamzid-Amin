import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reservation } from "../types";
import { RESTAURANT_INFO } from "../data";
import { Calendar, Users, MapPin, Clock, CheckCircle2, Ticket, Sparkles, ChevronRight } from "lucide-react";

export default function ReservationForm() {
  const [formData, setFormData] = useState<Reservation>({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: "",
    time: "18:00",
    seatingPreference: "main",
    occassion: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Reservation, string>>>({});
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");

  const TIME_SLOTS = [
    "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "5:00 PM",
    "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
    "8:30 PM", "9:00 PM"
  ];

  const SEATING_OPTIONS = [
    { id: "main", name: "Main Dining", desc: "Vibrant atmosphere, center hall" },
    { id: "booth", name: "Cozy Booth", desc: "More intimacy, soft bench seats" },
    { id: "patio", name: "Outdoor Garden Patio", desc: "Fresh air, fairy lights and heaters" },
    { id: "bar", name: "Chef's Counter", desc: "Watch our master chef pull and ladle" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 2 : value
    }));
    // Clear validation error on change
    if (errors[name as keyof Reservation]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Reservation, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please specify a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (e.g., 415-555-0192)";
    }
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please pick a time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate database booking write
    const code = "PHO-" + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    setRefCode(code);
    setSuccess(true);
  };

  const handleBookAgain = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      guests: 2,
      date: "",
      time: "18:00",
      seatingPreference: "main",
      occassion: "",
      specialRequests: "",
    });
    setSuccess(false);
    setRefCode("");
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 max-w-5xl mx-auto">
      {/* LEFT COLUMN: Booking Info & Ambiance Banner */}
      <div className="md:col-span-5 bg-neutral-900 text-white p-6 md:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative backdrop graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="space-y-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800/50">
            Table Reservations
          </span>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight font-sans">
              Reserve Your Place
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              Enjoy cozy seats while watching delicious broth being poured. We hold 30% of our floor space for spontaneous walk-ins daily.
            </p>
          </div>
        </div>

        <div className="space-y-5 border-t border-neutral-800 pt-8 mt-8">
          <div className="flex gap-4 items-start">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono uppercase text-neutral-400">Our Noodle Bar</p>
              <p className="text-sm font-semibold">{RESTAURANT_INFO.address}</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono uppercase text-neutral-400">Peak dining hours</p>
              <p className="text-sm font-semibold">Everyday 6:00 PM – 8:30 PM</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Ticket className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono uppercase text-neutral-400">Reservation policy</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Reservations are held for 15 minutes. Double-booking is automatically released. Call for group reservations of 8+.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-neutral-500 mt-8 pt-4 border-t border-neutral-800/50">
          Support Contact: {RESTAURANT_INFO.phone}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Scheduler / Success Board */}
      <div className="md:col-span-7 p-6 md:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="reservation-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Name field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Lan Anh Nguyen"
                    className={`w-full text-sm px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                      errors.name ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                    } bg-neutral-50/50`}
                  />
                  {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
                </div>

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="lananh@gmail.com"
                    className={`w-full text-sm px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                      errors.email ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                    } bg-neutral-50/50`}
                  />
                  {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
                </div>
              </div>

              {/* Phone & Guest counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="415-555-0192"
                    className={`w-full text-sm px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 ${
                      errors.phone ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                    } bg-neutral-50/50`}
                  />
                  {errors.phone && <p className="text-xs text-rose-600 font-medium">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                      <option value="8">8+ Guests (Covers sarge fee)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date & Time slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      name="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                        errors.date ? "border-rose-500 focus:ring-rose-500" : "border-neutral-200 focus:ring-emerald-500"
                      } bg-neutral-50/50 cursor-pointer`}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-rose-600 font-medium">{errors.date}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Select Dinning Time
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 appearance-none cursor-pointer"
                  >
                    {TIME_SLOTS.map(times => (
                      <option key={times} value={times}>
                        {times}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating preference cards */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                  Seating Zone Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SEATING_OPTIONS.map(opt => {
                    const isSelected = formData.seatingPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, seatingPreference: opt.id as any }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 focus:ring-1"
                            : "border-neutral-100 bg-neutral-50/30 hover:border-neutral-200 text-neutral-600"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs text-neutral-800">{opt.name}</span>
                          {isSelected && <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special instructions */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-neutral-600 font-sans tracking-wide">
                    Occasion / Special requests (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">Optional</span>
                </div>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. Birthday celebration, wheelchair access, high-chair needed..."
                  className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50"
                />
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Secure Table Reservation
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="reservation-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 space-y-6 max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Confirmed Booking
                </span>
                <h3 className="text-2xl font-semibold text-neutral-800 mt-2 font-sans tracking-tight">
                  You are all set, {formData.name}!
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-sans">
                  We look forward to hosting you. A sweet aromatic steam bowl and a table in the{" "}
                  <strong>{SEATING_OPTIONS.find(o => o.id === formData.seatingPreference)?.name}</strong> zone is held under your email.
                </p>
              </div>

              {/* Confirmation ticket info box */}
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-left font-sans space-y-3">
                <div className="flex justify-between border-b border-neutral-200 pb-2 bg-transparent text-xs text-neutral-400 font-mono">
                  <span>CONFIRMATION PASS</span>
                  <span className="font-semibold text-emerald-700">{refCode}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Date</span>
                    <p className="text-xs font-semibold text-neutral-700">{formData.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Time</span>
                    <p className="text-xs font-semibold text-neutral-700">{formData.time}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Guests</span>
                    <p className="text-xs font-semibold text-neutral-700">{formData.guests} diners</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Zone</span>
                    <p className="text-xs font-semibold text-neutral-700 capitalize">
                      {SEATING_OPTIONS.find(o => o.id === formData.seatingPreference)?.name.split(" ")[0]}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 leading-relaxed pt-2 border-t border-neutral-200/50 border-dashed">
                  Cancel or modify free of charge at any time. A receipt has been channeled to <strong>{formData.email}</strong>.
                </div>
              </div>

              {/* Action commands */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBookAgain}
                  className="flex-1 text-xs border border-neutral-200 hover:bg-neutral-50 text-neutral-600 bg-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Book New Reservation
                </button>
                <div className="flex-1 bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow cursor-default">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pass Added
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
