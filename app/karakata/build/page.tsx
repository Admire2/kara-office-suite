"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function StoreBuilder() {
  const [mode, setMode] = useState<"select" | "ai-form" | "ai-result" | "manual">("select");
  
  // Form State
  const [formData, setFormData] = useState({ what: "", vibe: "", city: "Lagos", country: "Nigeria", email: "" });
  
  // Generated Store State (Editable)
  const [store, setStore] = useState({
    title: "KaraKata Luxe",
    tagline: "Luxury Bags, Crafted in Lagos",
    description: "At KaraKata Luxe, we blend Nigerian artistry with global luxury standards...",
    products: [
      { id: 1, name: "Oya Tote", price: "295", desc: "Structured full-grain leather tote.", image: "" },
      { id: 2, name: "Ibeji Clutch", price: "248", desc: "Compact silk-lined clutch.", image: "" },
    ]
  });

  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Handle AI Generation (Mocked for now, connects to your AI later)
  const handleGenerate = () => {
    // In a real app, this calls your AI API. For now, we just switch to result mode with default data.
    setStore(prev => ({
      ...prev,
      title: formData.vibe ? `${formData.vibe} Store` : "My Luxury Store",
      description: `Welcome to ${formData.what || "our store"} in ${formData.city}. We offer the finest craftsmanship.`
    }));
    setMode("ai-result");
  };

  // Handle Image Upload to Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingId(productId);
    const path = `store-${Date.now()}-${file.name}`;
    
    const { error } = await sb.storage.from("kara").upload(path, file, { upsert: true });
    
    if (!error) {
      const { data } = sb.storage.from("kara").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      
      setStore(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === productId ? { ...p, image: publicUrl } : p)
      }));
    }
    setUploadingId(null);
  };

  // Update Store Fields
  const updateField = (field: string, value: string) => setStore(prev => ({ ...prev, [field]: value }));
  const updateProduct = (id: number, field: string, value: string) => {
    setStore(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // --- RENDER: MODE SELECTOR ---
  if (mode === "select") {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-2">KaraKata StoreBuilder</h1>
        <p className="text-slate-400 mb-12 text-center max-w-lg">How do you want to create your storefront?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <button onClick={() => setMode("ai-form")} className="p-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 transition text-left border border-emerald-400/30">
            <div className="text-3xl mb-4">?</div>
            <h2 className="text-2xl font-bold mb-2">Build with AI</h2>
            <p className="text-emerald-100 text-sm">Describe your business. Our AI designs your storefront, writes your copy, and stocks 5 starter products.</p>
          </button>
          
          <Link href="/karakata/seller" className="p-8 rounded-2xl bg-slate-800 hover:bg-slate-700 transition text-left border border-slate-700 block">
            <div className="text-3xl mb-4">????</div>
            <h2 className="text-2xl font-bold mb-2">Build Manually</h2>
            <p className="text-slate-400 text-sm">You have full control. Upload your own photos, write your own descriptions, and set your own prices step-by-step.</p>
          </Link>
        </div>
      </main>
    );
  }

  // --- RENDER: AI FORM (Image 1) ---
  if (mode === "ai-form") {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
        <Link href="/" className="self-start text-cyan-400 hover:underline mb-8">? Back to market</Link>
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold">KaraKata StoreBuilder <span className="text-emerald-400">?</span></h1>
          <p className="text-slate-400">Describe your business - our AI designs your storefront, writes your copy, and stocks 5 starter products.</p>
          
          <div className="space-y-4">
            <input value={formData.what} onChange={e => setFormData({...formData, what: e.target.value})} placeholder="What do you sell? e.g. handwoven aso oke belts and adire scarves" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" />
            <input value={formData.vibe} onChange={e => setFormData({...formData, vibe: e.target.value})} placeholder="Store vibe? e.g. royal, earthy, luxury, playful" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" />
              <input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="Country" className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" />
            </div>
            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Your email (for store ownership)" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" />
          </div>

          <button onClick={handleGenerate} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 rounded-lg text-lg transition">
            ? Design my store with AI
          </button>
        </div>
      </main>
    );
  }

  // --- RENDER: EDITABLE RESULT (Images 2 & 3 but interactive) ---
  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-cyan-400 hover:underline">? Back to market</Link>
          <div className="flex gap-3">
            <button onClick={() => setMode("ai-form")} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold">? Redesign</button>
            <button className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold">??? Publish my store live</button>
          </div>
        </div>

        {/* Editable Header */}
        <div className="bg-blue-600 rounded-2xl p-8 mb-8">
          <input value={store.title} onChange={e => updateField("title", e.target.value)} className="w-full bg-transparent text-3xl font-bold text-white border-b border-blue-400/50 focus:border-white outline-none mb-2" />
          <input value={store.tagline} onChange={e => updateField("tagline", e.target.value)} className="w-full bg-transparent text-xl text-blue-100 border-b border-blue-400/50 focus:border-white outline-none mb-4" />
          <p className="text-sm text-blue-200">{formData.city}, {formData.country}</p>
        </div>

        <textarea value={store.description} onChange={e => updateField("description", e.target.value)} rows={3} className="w-full bg-transparent text-lg text-slate-300 mb-8 border-b border-slate-700 focus:border-emerald-500 outline-none resize-none" />

        {/* Editable Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {store.products.map((p) => (
            <div key={p.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition">
              {/* Image Upload Area */}
              <div className="relative h-48 bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden group">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-600 text-sm">No image uploaded</span>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold text-sm">??? Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, p.id)} />
                </label>
                {uploadingId === p.id && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white">Uploading...</div>}
              </div>

              {/* Editable Fields */}
              <input value={p.name} onChange={e => updateProduct(p.id, "name", e.target.value)} className="w-full bg-transparent text-xl font-bold text-white border-b border-slate-700 focus:border-emerald-500 outline-none mb-2" />
              <textarea value={p.desc} onChange={e => updateProduct(p.id, "desc", e.target.value)} rows={2} className="w-full bg-transparent text-sm text-slate-400 mb-4 border-b border-slate-700 focus:border-emerald-500 outline-none resize-none" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500">$</span>
                <input value={p.price} onChange={e => updateProduct(p.id, "price", e.target.value)} type="number" className="w-24 bg-transparent text-2xl font-bold text-emerald-400 border-b border-slate-700 focus:border-emerald-500 outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
