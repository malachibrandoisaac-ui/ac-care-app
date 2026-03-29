"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [listAntrean, setListAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fungsi Cek Login (Proteksi Halaman)
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Jika tidak ada session, tendang ke halaman login
      router.push("/login");
    } else {
      // Jika ada, baru ambil data antrean
      fetchAntrean();
    }
  };

  // 2. Fungsi Logout
  const handleLogout = async () => {
    const tanya = confirm("Apakah Anda yakin ingin keluar?");
    if (tanya) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  // 3. Ambil data yang HANYA berstatus 'Antri'
  const fetchAntrean = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Service AC")
      .select("*")
      .eq("status", "Antri")
      .order("nomor_antrean", { ascending: true });

    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      setListAntrean(data || []);
    }
    setLoading(false);
  };

  // 4. Fungsi Ubah Status jadi Selesai
  const handleSelesai = async (nomor: number, nama: string) => {
    const tanya = confirm(`Tandai ${nama} sebagai Selesai?`);
    
    if (tanya) {
      const { data, error } = await supabase
        .from("Service AC")
        .update({ status: 'Selesai' })
        .eq("nomor_antrean", nomor)
        .select();

      if (error) {
        alert("Gagal simpan ke database: " + error.message);
      } else if (data && data.length === 0) {
        alert("Gagal: Data tidak ditemukan.");
      } else {
        setListAntrean((prev) => prev.filter(item => item.nomor_antrean !== nomor));
        alert("Pesanan berhasil diselesaikan!");
      }
    }
  };

  // 5. Efek untuk Cek Auth & Real-time
  useEffect(() => {
    checkUser();

    const channel = supabase
      .channel("admin_updates")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "Service AC" }, 
        () => {
          fetchAntrean();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 text-black">
      <div className="max-w-5xl mx-auto">
        {/* HEADER PANEL */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Panel Kendali Admin 🛠️</h1>
            <p className="text-slate-500">Selamat bekerja! Kelola antrean aktif di bawah ini.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="/riwayat" className="bg-white border hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition text-sm">
              📜 Riwayat
            </a>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition text-sm"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 font-semibold text-center">No</th>
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Layanan</th>
                  <th className="p-4 font-semibold">Kontak & Alamat</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400">Menyingkronkan data...</td></tr>
                ) : listAntrean.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic font-medium">Belum ada antrean masuk saat ini. ☕</td></tr>
                ) : (
                  listAntrean.map((item, index) => (
                    <tr key={item.nomor_antrean} className="hover:bg-blue-50/30 transition">
                      <td className="p-4 text-center">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold text-xs">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{item.Nama}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono">{item.Tanggal}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          {item.Layanan}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-green-700">📱 {item.whatsapp}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{item.Alamat}</p>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleSelesai(item.nomor_antrean, item.Nama)}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Selesai
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
        <div className="mt-8 flex justify-center gap-6 text-slate-400 text-[10px] font-mono">
          <p>● STATUS: TERKUNCI (ADMIN ONLY)</p>
          <p>● TOTAL ANTREAN: {listAntrean.length}</p>
        </div>
      </div>
    </main>
  );
}