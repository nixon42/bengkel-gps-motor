import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara melacak proses servis mobil saya secara online?',
    answer: 'Cukup masukkan plat nomor kendaraan Anda (contoh: AG 1822 AB) pada menu "Cek Status Servis" di halaman ini tanpa perlu login. Sistem akan menampilkan tahapan pengerjaan secara real-time (6 tahapan), foto dokumentasi sebelum & sesudah, catatan mekanik, dan estimasi waktu selesai.'
  },
  {
    id: 2,
    question: 'Apakah nomor HP atau alamat rumah saya akan terlihat oleh orang lain saat dicek online?',
    answer: 'Sama sekali tidak. Kami menerapkan Privacy Masking ketat: nomor telepon dan alamat rumah dihapus total dari data publik, sedangkan plat nomor dan nama pemilik disamarkan otomatis (contoh: AG 18** AB dan Joko W*****).'
  },
  {
    id: 3,
    question: 'Apakah melayani servis panggilan ke rumah atau darurat mogok?',
    answer: 'Ya! Untuk wilayah sekitar Sambiresik, Gampengrejo, Ngasem, dan Kediri Kota, kami melayani bantuan darurat mesin mogok, aki tekor, ganti ban, dan servis ringan di lokasi. Hubungi WhatsApp darurat kami di 0856-0330-7330.'
  },
  {
    id: 4,
    question: 'Apakah ada garansi setelah servis di Bengkel GPS Motor Kediri?',
    answer: 'Semua pekerjaan perbaikan mesin, tune up, kelistrikan, dan penggantian sparepart di bengkel kami disertai garansi kerja. Apabila ada keluhan setelah servis, silakan bawa kembali unit Anda untuk pengecekan ulang tanpa biaya jasa tambahan.'
  },
  {
    id: 5,
    question: 'Metode pembayaran apa saja yang diterima di bengkel?',
    answer: 'Kami menerima pembayaran tunai (Cash), transfer bank (BCA, Mandiri, BRI, BNI), serta scan QRIS instan dari semua aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay) dan mobile banking.'
  },
  {
    id: 6,
    question: 'Apakah sparepart bekas yang diganti bisa dibawa pulang?',
    answer: 'Tentu saja! Kebijakan bengkel kami menjamin transparansi 100%. Semua suku cadang lama yang diganti akan disimpan dalam wadah dan diserahkan kembali kepada pemilik mobil saat pengambilan kendaraan.'
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState(1);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="bg-slate-50 dark:bg-slate-950/50 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Tanya Jawab
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Informasi seputar pengerjaan, privasi tracking, garansi, dan operasional Bengkel GPS Motor Kediri.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="touch-target w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <span className="flex items-center space-x-3 pr-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    <p className="mt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
