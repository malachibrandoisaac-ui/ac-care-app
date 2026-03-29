"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function AntreanPage() {
  const [listAntrean, setListAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAntrean = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Service AC")
      .select("nomor_antrean, Nama, Layanan, Tanggal, status")
      .in("status", ["Antri", "Dalam Perjalanan", "Sedang Dikerjakan"]) 
      .order("nomor_antrean", { ascending: true });
  
    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      setListAntrean(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAntrean();
    const channel = supabase.channel("antrean_live").on("postgres_changes", { event: "*", schema: "public", table: "Service AC" }, () => fetchAntrean()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-200 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] mb-4 border border-blue-500/20">
            LIVE MONITORING
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Status Antrean</h1>
          <p className="text-slate-500 text-sm italic">Halaman ini diperbarui secara otomatis</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-500 font-medium">Menyinkronkan antrean...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {listAntrean.length === 0 ? (
              <div className="text-center bg-slate-900/50 p-16 rounded-[2rem] border-2 border-dashed border-slate-800">
                <p className="text-slate-500 text-lg">Belum ada antrean aktif.</p>
                <Link href="/" className="mt-4 inline-block text-blue-400 font-bold hover:text-blue-300 transition">
                  Daftar Sekarang →
                </Link>
              </div>
            ) : (
              listAntrean.map((item, index) => {
                // Logika Warna & Animasi berdasarkan Status
                const isActive = item.status === 'Sedang Dikerjakan';
                const isOTW = item.status === 'Dalam Perjalanan';
                const isWaiting = item.status === 'Antri';

                return (
                  <div 
                    key={item.nomor_antrean} 
                    className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 ${
                      isActive ? 'bg-slate-900 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 
                      isOTW ? 'bg-slate-900 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 
                      'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        {/* Nomor Urut Besar */}
                        <div className="flex flex-col items-center">
                          <span className={`text-4xl font-black leading-none ${
                            isWaiting ? 'text-slate-800' : 'text-slate-700'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-widest">Urutan</span>
                        </div>

                        <div>
                          <h3 className={`font-bold text-lg transition-colors ${isWaiting ? 'text-slate-300' : 'text-white'}`}>
                            {item.Nama}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.Layanan}</p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        {/* BADGE STATUS */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 ${
                          isWaiting ? 'bg-slate-800 text-slate-500' : 
                          isOTW ? 'bg-amber-500 text-black' : 
                          'bg-blue-600 text-white'
                        }`}>
                          {isWaiting && <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>}
                          {isOTW && <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></span>}
                          {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                          
                          {isWaiting ? 'Menunggu' : isOTW ? 'Otw Lokasi' : 'Dikerjakan'}
                        </div>
                        
                        <p className="text-[9px] text-slate-600 font-mono font-bold tracking-tighter">
                          BOOKED: {item.Tanggal}
                        </p>
                      </div>
                    </div>

                    {/* Progress Line Dekoratif (Hanya muncul jika sedang diproses) */}
                    {(isActive || isOTW) && (
                      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${
                        isActive ? 'bg-blue-500 w-full' : 'bg-amber-500 w-1/2'
                      }`}></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        
        {/* INFO TAMBAHAN */}
        <div className="mt-16 text-center border-t border-slate-900 pt-8">
          <p className="text-slate-600 text-xs mb-6 leading-relaxed">
            Silakan tunggu di lokasi. Teknisi kami akan menghubungi Anda <br/> 
            saat status berubah menjadi <strong>"Otw Lokasi"</strong>.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 font-bold text-sm transition-all group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Beranda
          </Link>
        </div>

      </div>
    </main>
  );
}