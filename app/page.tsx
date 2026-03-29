"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function BookingPage() {
  const daftarLayanan = [
    { nama: "Cuci AC", harga: 150000 },
    { nama: "Bongkar Pasang AC", harga: 250000 },
    { nama: "Periksa AC", harga: 0 }, 
  ];

  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    alamat: "",
    layanan: "",
    harga: "",
    keluhan: "",
    tanggal: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLayananChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = daftarLayanan.find((l) => l.nama === e.target.value);
    setFormData({
      ...formData,
      layanan: e.target.value,
      harga: selected?.harga === 0 ? "Dicek di lokasi" : `Rp ${selected?.harga.toLocaleString()}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("Service AC").insert([
      {
        Nama: formData.nama,
        whatsapp: formData.whatsapp,
        Alamat: formData.alamat,
        Layanan: formData.layanan,
        Keluhan: formData.keluhan,
        Tanggal: formData.tanggal,
        status: "Antri",
      },
    ]);

    if (error) {
      alert("Gagal kirim data: " + error.message);
    } else {
      const pesanWA = `Halo Admin AC-Care,%0A%0A` +
        `Ada Booking Baru!%0A` +
        `*Nama:* ${formData.nama}%0A` +
        `*Layanan:* ${formData.layanan}%0A` +
        `*Estimasi Harga:* ${formData.harga}%0A` +
        `*Keluhan:* ${formData.keluhan || "-"}%0A` +
        `*Alamat:* ${formData.alamat}%0A` +
        `*Tanggal:* ${formData.tanggal}%0A%0A` +
        `Mohon segera dikonfirmasi ya!`;

      const nomorAdmin = "6281953517111"; // Ganti dengan nomor WA Anda
      window.open(`https://wa.me/${nomorAdmin}?text=${pesanWA}`, "_blank");
      
      alert("Booking Berhasil! Mengalihkan ke WhatsApp...");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white p-4 text-black flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 bg-slate-50 p-8 rounded-2xl border shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Booking Service AC</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Sejuk & Nyaman Kembali</p>
        </div>

        {/* Input Fields */}
        <input
          type="text"
          placeholder="Nama Lengkap"
          required
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="No. WhatsApp"
            required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
          <input
            type="date"
            required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Pilihan Layanan</label>
          <select
            required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            onChange={handleLayananChange}
          >
            <option value="">-- Pilih Layanan --</option>
            {daftarLayanan.map((l, i) => (
              <option key={i} value={l.nama}>
                {l.nama} {l.harga > 0 ? `(Rp ${l.harga.toLocaleString()})` : ""}
              </option>
            ))}
          </select>
          {formData.harga && (
            <p className="mt-1 ml-1 text-sm font-bold text-blue-600 italic">Estimasi: {formData.harga}</p>
          )}
        </div>

        <textarea
          placeholder="Jelaskan keluhan AC Anda..."
          rows={2}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
        />

        <textarea
          placeholder="Alamat Lengkap"
          required
          rows={2}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
        />

        {/* --- TOMBOL AKSI --- */}
        <div className="pt-2 space-y-3">
          {/* Tombol Booking (Biru) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            {loading ? "Sedang Memproses..." : "Booking Sekarang via WA"}
          </button>

          {/* Tombol Lihat Antrean (Hitam) */}
          <Link 
            href="/antrean" 
            className="block w-full bg-black hover:bg-slate-800 text-white text-center p-4 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Lihat Antrean Saat Ini 📊
          </Link>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase">
          Tukang AC Jujur & Profesional
        </p>
      </form>
    </main>
  );
}