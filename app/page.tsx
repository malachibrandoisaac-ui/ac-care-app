"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function BookingPage() {
  // Daftar Layanan dan Harga
  const daftarLayanan = [
    { nama: "Cuci AC", harga: 150000 },
    { nama: "Tambah Freon", harga: 250000 },
    { nama: "Bongkar Pasang AC", harga: 250000 },
    { nama: "Periksa AC", harga: 100000 },
    { nama: "Lainnya", harga: 0 }, // Harga 0 berarti nanti dicek di lokasi
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

  // Fungsi saat pilihan layanan berubah
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

    // 1. Simpan ke Supabase
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
      // 2. Format Pesan WhatsApp
      const pesanWA = `Halo Admin AC-Care,%0A%0A` +
        `Ada Booking Baru!%0A` +
        `*Nama:* ${formData.nama}%0A` +
        `*Layanan:* ${formData.layanan}%0A` +
        `*Estimasi Harga:* ${formData.harga}%0A` +
        `*Keluhan:* ${formData.keluhan || "-"}%0A` +
        `*Alamat:* ${formData.alamat}%0A` +
        `*Tanggal:* ${formData.tanggal}%0A%0A` +
        `Mohon segera dikonfirmasi ya!`;

      window.open(`https://wa.me/628123456789?text=${pesanWA}`, "_blank");
      alert("Booking Berhasil! Mengalihkan ke WhatsApp...");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white p-6 text-black flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 bg-slate-50 p-8 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700 text-center mb-6">Booking Service AC</h1>

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

        {/* Pilihan Layanan */}
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

        {/* Kolom Keluhan */}
        <textarea
          placeholder="Jelaskan keluhan AC (Contoh: AC Berisik, Tidak Dingin, atau Menetes air)"
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
      </form>
    </main>
  );
}