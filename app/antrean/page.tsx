"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AntreanPage() {
  const [listAntrean, setListAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi untuk mengambil data awal
  const fetchAntrean = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Service AC")
  .select("nomor_antrean, Nama, Layanan, Tanggal")
  .eq("status", "Antri") // <--- HANYA TAMPILKAN YANG MASIH ANTRI
  .order("nomor_antrean", { ascending: true });
  
    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      console.log("Data berhasil dimuat:", data);
      setListAntrean(data || []);
    }
    setLoading(false);
  };

  // 2. Efek untuk Fetch Awal + Real-time
  useEffect(() => {
    fetchAntrean();

    // AKTIFKAN REAL-TIME
    const channel = supabase
      .channel("antrean_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Service AC" },
        (payload) => {
          console.log("Ada pesanan baru masuk secara real-time!", payload.new);
          // Kita masukkan data baru ke dalam list
          setListAntrean((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Status Antrean</h1>
        <p className="text-center text-slate-500 mb-8 font-medium">Data Terupdate Real-time</p>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-slate-600">Menghubungkan ke database...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listAntrean.length === 0 ? (
              <div className="text-center bg-white p-10 rounded-lg shadow-sm border border-dashed border-slate-300">
                <p className="italic text-slate-400">Belum ada antrean untuk saat ini.</p>
                <button 
                  onClick={fetchAntrean}
                  className="mt-4 text-sm text-blue-600 underline"
                >
                  Cek ulang data
                </button>
              </div>
            ) : (
              listAntrean.map((item, index) => (
                <div 
                  key={item.nomor_antrean || index} 
                  className={`flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border-l-8 transition-all hover:shadow-md ${
                    index === 0 ? 'border-green-500 bg-green-50 ring-2 ring-green-100' : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-slate-200">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{item.Nama}</h3>
                      <p className="text-sm text-slate-500">{item.Layanan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      {item.Tanggal}
                    </span>
                    {index === 0 && (
                      <p className="text-[10px] mt-2 text-green-600 font-bold uppercase tracking-widest animate-pulse">
                        ● Sedang Dikerjakan
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="mt-12 text-center border-t border-slate-200 pt-6">
          <a href="/" className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center justify-center gap-2">
            <span>←</span> Kembali ke Form Booking
          </a>
        </div>
      </div>
    </main>
  );
}