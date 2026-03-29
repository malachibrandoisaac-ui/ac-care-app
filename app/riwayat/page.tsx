"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      fetchRiwayat();
    }
  };

  const fetchRiwayat = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Service AC")
      .select("*")
      .eq("status", "Selesai")
      .order("nomor_antrean", { ascending: false });

    if (error) console.error("Gagal ambil riwayat:", error.message);
    else setRiwayat(data || []);
    setLoading(false);
  };

  const handleDelete = async (nomor: number, nama: string) => {
    if (confirm(`Hapus riwayat atas nama ${nama}?`)) {
      const { error } = await supabase
        .from("Service AC")
        .delete()
        .eq("nomor_antrean", nomor)
        .eq("status", "Selesai");

      if (error) {
        alert("Gagal hapus: " + error.message);
      } else {
        setRiwayat(riwayat.filter((item) => item.nomor_antrean !== nomor));
      }
    }
  };

  const handleDeleteAll = async () => {
    const kodeKeamanan = "HAPUS";
    const konfirmasi = prompt(`PERINGATAN! Anda akan menghapus SELURUH riwayat. Ketik "${kodeKeamanan}" untuk melanjutkan:`);

    if (konfirmasi === kodeKeamanan) {
      const { error } = await supabase
        .from("Service AC")
        .delete()
        .eq("status", "Selesai");

      if (error) {
        alert("Gagal hapus semua: " + error.message);
      } else {
        setRiwayat([]);
        alert("Seluruh riwayat telah dibersihkan.");
      }
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">📜 Riwayat Servis</h1>
            <p className="text-slate-500 text-sm mt-1">Laporan pengerjaan yang telah diselesaikan</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleDeleteAll}
              className="flex-1 md:flex-none bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              🗑️ Bersihkan Semua
            </button>
            <button 
              onClick={() => router.push("/dapur-admin")}
              className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="p-5">Pelanggan & Tanggal</th>
                  <th className="p-5">Layanan</th>
                  <th className="p-5">Hasil Kerja (Laporan)</th>
                  <th className="p-5">Kontak & Alamat</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-600 animate-pulse font-mono">Loading data...</td></tr>
                ) : riwayat.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-500 italic">Belum ada riwayat pekerjaan selesai.</td></tr>
                ) : (
                  riwayat.map((item) => (
                    <tr key={item.nomor_antrean} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-white">{item.Nama}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{item.Tanggal}</p>
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {item.Layanan}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg max-w-[250px]">
                          <p className="text-xs text-blue-400 leading-relaxed italic">
                            "{item.deskripsi_hasil || 'Tidak ada catatan hasil kerja'}"
                          </p>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-xs font-bold text-green-500 mb-1">📱 {item.whatsapp}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic">{item.Alamat}</p>
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => handleDelete(item.nomor_antrean, item.Nama)}
                          className="text-slate-600 hover:text-red-500 transition-colors p-2"
                          title="Hapus permanen"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 flex justify-between items-center text-[10px] text-slate-700 font-mono tracking-widest uppercase">
          <p>Database Archive System</p>
          <p>Total Arsip: {riwayat.length}</p>
        </div>
      </div>
    </main>
  );
}