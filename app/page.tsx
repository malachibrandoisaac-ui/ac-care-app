"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link"; // Import Link untuk navigasi

export default function BookingPage() {
  const daftarLayanan = [
    { nama: "Cuci AC", harga: 150000 },
    { nama: "Tambah Freon", harga: 250000 },
    { nama: "Bongkar Pasang AC", harga: 250000 },
    { nama: "Periksa AC", harga: 100000 },
    { nama: "Lainnya...", harga: 0 }, 
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
    <main className="min-h-screen bg-white p-4 text-black flex flex-col items-center justify-center">
      
      {/* TOMBOL KE LAMAN ANTREAN (Diletakkan di atas Form) */}
      <div className="max-w-md w-full mb-4 flex justify-end">
        <Link 
          href="/antrean" 
          className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
        >
          📊 Lihat Antrean Saat Ini →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 bg-slate-50 p-8 rounded-2xl border shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Booking AC Care Service</h1>
          <p className="text-xs text-slate-500 mt-1">Isi data-data di bawah ini untuk menjadwalkan servis</p>
        </div>

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
          <label className="text-xs font-bold text-slate-500 ml-1">PILIH LAYANAN</label>
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
            <p className="mt-1 ml-1 text-sm font-bold text-blue-600 italic">Estimasi Biaya: {formData.harga}</p>
          )}
        </div>

        <textarea
          placeholder="Jelaskan keluhan AC (Contoh: Tidak Dingin, Bocor, dll)"
          rows={3}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
        />

        <textarea
          placeholder="Alamat Lengkap"
          required
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          {loading ? "Memproses..." : "Booking Sekarang via WA"}
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest">
          Fast Response • Bergaransi • Profesional
        </p>
      </form>
    </main>
  );
}