"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fungsi Proteksi Login
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      fetchRiwayat();
    }
  };

  // 2. Ambil data riwayat
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

  // 3. Fungsi Hapus Per Pekerjaan
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
        alert("Riwayat berhasil dihapus.");
      }
    }
  };

  // 4. Fungsi Hapus SEMUA Riwayat
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
    } else if (konfirmasi !== null) {
      alert("Kode salah. Penghapusan dibatalkan.");
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-black">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">📜 Riwayat Servis</h1>
            <p className="text-slate-500 text-sm">Data pekerjaan yang telah selesai dikerjakan</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDeleteAll}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition"
            >
              🗑️ Bersihkan Riwayat
            </button>
            <a href="/dapur-admin" className="bg-white border px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition shadow-sm">
              ← Kembali ke Admin
            </a>
          </div>
        </div>

        {/* TABEL RIWAYAT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Layanan</th>
                  <th className="p-4 font-semibold">Alamat</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Memuat riwayat...</td></tr>
                ) : riwayat.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Riwayat masih kosong.</td></tr>
                ) : (
                  riwayat.map((item) => (
                    <tr key={item.nomor_antrean} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{item.Nama}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{item.whatsapp}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">
                          {item.Layanan}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600 italic max-w-xs truncate">
                        {item.Alamat}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(item.nomor_antrean, item.Nama)}
                          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition border border-red-100"
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
        
        {/* FOOTER */}
        <div className="mt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <p>PROTECTED BY SUPABASE AUTH</p>
          <p>TOTAL RIWAYAT: {riwayat.length}</p>
        </div>
      </div>
    </main>
  );
}