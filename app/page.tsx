"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    layanan: "Cuci AC",
    tanggal: "",
    alamat: "" // <-- Tambahkan state alamat
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Proses mengirim data ke tabel 'Service AC'
    const { error } = await supabase
      .from("Service AC")
      .insert([
        { 
          Nama: formData.nama, 
          whatsapp: formData.whatsapp, 
          Layanan: formData.layanan,
          Tanggal: formData.tanggal,
          Alamat: formData.alamat // <-- Kirim data Alamat ke database
        }
      ]);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Mantap! Data booking sudah masuk ke database.");
      // Reset semua form
      setFormData({ 
        nama: "", 
        whatsapp: "", 
        layanan: "Cuci AC", 
        tanggal: "",
        alamat: "" 
      }); 
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-black">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">🛠️ Booking AC-Care Service</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
            <input 
              required
              type="text"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
            <input 
              required
              type="tel"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Rencana Servis</label>
            <input 
              required
              type="date"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.tanggal}
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
            />
          </div>

          {/* Alamat - INI YANG BARU */}
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
            <textarea 
              required
              rows={3}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Jl. Melati No. 123, Blok C, Jakarta"
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            />
          </div>

          {/* Layanan */}
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Layanan</label>
            <select 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.layanan}
              onChange={(e) => setFormData({...formData, layanan: e.target.value})}
            >
              <option>Cuci AC</option>
              <option>Tambah Freon</option>
              <option>Perbaikan Bocor</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            {loading ? "Menghubungkan ke Server..." : "Konfirmasi Pesanan"}
          </button>
        </form>
      </div>
    </main>
  );
}