"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [listAntrean, setListAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Proteksi Login
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      fetchAntrean();
    }
  };

  // 2. Fungsi Logout
  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  // 3. Ambil data yang berstatus aktif (Antri, Dalam Perjalanan, Sedang Dikerjakan)
  const fetchAntrean = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Service AC")
      .select("*")
      .in("status", ["Antri", "Dalam Perjalanan", "Sedang Dikerjakan"])
      .order("nomor_antrean", { ascending: true });

    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      setListAntrean(data || []);
    }
    setLoading(false);
  };

  // 4. Fungsi Update Status Bertahap & Input Deskripsi
  const handleUpdateStatus = async (nomor: number, statusBaru: string, nama: string) => {
    let updateData: any = { status: statusBaru };

    // Jika pilih 'Selesai', minta input deskripsi hasil kerja
    if (statusBaru === "Selesai") {
      const deskripsi = prompt(`Pekerjaan ${nama} selesai. Apa saja yang dikerjakan? (Contoh: Cuci AC & Tambah Freon)`);
      
      // Jika user klik cancel atau kosongkan input, batalkan proses selesai
      if (deskripsi === null) return;
      if (deskripsi.trim() === "") {
        alert("Deskripsi pekerjaan harus diisi agar masuk ke riwayat.");
        return;
      }
      
      updateData.deskripsi_hasil = deskripsi;
    }

    const { error } = await supabase
      .from("Service AC")
      .update(updateData)
      .eq("nomor_antrean", nomor);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      // Refresh data lokal
      fetchAntrean();
      if (statusBaru === "Selesai") alert("Pekerjaan berhasil disimpan ke riwayat.");
    }
  };

  useEffect(() => {
    checkUser();

    const channel = supabase
      .channel("admin_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "Service AC" }, () => {
        fetchAntrean();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER PANEL */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-blue-400 tracking-tight">Control Panel Admin 🛠️</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola progres teknisi dan antrean aktif</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => router.push("/riwayat")}
              className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              📜 Riwayat
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 md:flex-none bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="p-5">Pelanggan</th>
                  <th className="p-5">Layanan & Keluhan</th>
                  <th className="p-5">Alamat</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Update Progres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-600 animate-pulse">Sinkronisasi data...</td></tr>
                ) : listAntrean.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-500 italic">Kopi dulu bos, antrean lagi kosong. ☕</td></tr>
                ) : (
                  listAntrean.map((item) => (
                    <tr key={item.nomor_antrean} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-white text-base">{item.Nama}</p>
                        <p className="text-[10px] text-green-500 font-mono mt-1">📱 {item.whatsapp}</p>
                      </td>
                      <td className="p-5">
                        <span className="bg-blue-900/40 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {item.Layanan}
                        </span>
                        <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">"{item.Keluhan || 'Tidak ada keluhan tertulis'}"</p>
                      </td>
                      <td className="p-5">
                        <p className="text-xs text-slate-500 max-w-[200px] line-clamp-2">{item.Alamat}</p>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border
                          ${item.status === 'Antri' ? 'bg-slate-800 text-slate-400 border-slate-700' : 
                            item.status === 'Dalam Perjalanan' ? 'bg-amber-900/30 text-amber-500 border-amber-800' : 
                            'bg-blue-900/30 text-blue-400 border-blue-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(item.nomor_antrean, "Dalam Perjalanan", item.Nama)}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition active:scale-95"
                            title="Klik saat mulai berangkat"
                          >
                            🚗 Jalan
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item.nomor_antrean, "Sedang Dikerjakan", item.Nama)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition active:scale-95"
                            title="Klik saat mulai bongkar/service"
                          >
                            🛠️ Kerja
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item.nomor_antrean, "Selesai", item.Nama)}
                            className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition active:scale-95"
                            title="Selesaikan & tulis laporan"
                          >
                            ✅ Selesai
                          </button>
                        </div>
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
          <p>AUTHORIZED ADMIN ACCESS ONLY</p>
          <p>Total Antrean Aktif: {listAntrean.length}</p>
        </div>
      </div>
    </main>
  );
}