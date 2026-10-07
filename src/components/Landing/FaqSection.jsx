import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara melacak progres servis mobil saya secara online?',
    answer: 'Cukup masukkan plat nomor mobil Anda (misalnya: AG 1822 AB) di form pelacakan pada halaman ini. Tanpa perlu registrasi atau login, sistem langsung menampilkan status 6 tahapan pengerjaan secara transparan, foto dokumentasi pengerjaan sebelum & sesudah, serta rincian sparepart yang diganti.'
  },
  {
    id: 2,
    question: 'Apakah nomor WhatsApp atau identitas pribadi saya aman saat dilacak?',
    answer: 'Sangat aman. Sistem menerapkan Privacy Masking ketat: nomor WhatsApp dan alamat rumah tidak pernah ditampilkan ke publik, sedangkan nama pemilik disensor otomatis (contoh: Budi S******) demi menjaga privasi penuh Anda.'
  },
  {
    id: 3,
    question: 'Apakah saya akan diberitahu estimasi biaya sebelum perbaikan dimulai?',
    answer: 'Pasti. Prinsip kami adalah transparansi tanpa biaya siluman. Setelah mekanik melakukan inspeksi fisik atau scanning komputer (OBD2), kami akan menginformasikan estimasi biaya jasa dan pilihan suku cadang terlebih dahulu kepada Anda sebelum pengerjaan dimulai.'
  },
  {
    id: 4,
    question: 'Apakah suku cadang lama yang diganti bisa saya bawa pulang?',
    answer: 'Wajib. Semua part bekas yang telah diganti akan kami kumpulkan dan diserahkan kembali kepada Anda saat pengambilan mobil sebagai bukti keaslian penggantian barang.'
  },
  {
    id: 5,
    question: 'Bagaimana ketentuan garansi jika keluhan kembali muncul setelah servis?',
    answer: 'Semua pengerjaan servis dan penggantian suku cadang di Bengkel GPS Motor bergaransi. Jika timbul kendala serupa dalam masa garansi, bawa kembali mobil ke workshop Sambiresik untuk pemeriksaan ulang tanpa dikenakan biaya jasa.'
  },
  {
    id: 6,
    question: 'Apakah melayani panggilan darurat mesin mogok di area Kediri?',
    answer: 'Ya. Untuk wilayah Sambiresik, Gampengrejo, Ngasem, dan Kediri Kota, kami melayani penanganan darurat mobil mogok, jumper aki, atau pemeriksaan awal di lokasi. Hubungi WhatsApp darurat kami di 0856-0330-7330.'
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState(1);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="bg-white dark:bg-slate-900 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No eyebrow kicker) */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Pertanyaan Umum &amp; Kejelasan Servis
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Informasi lengkap seputar estimasi biaya, garansi perbaikan, prosedur suku cadang, dan privasi pelacakan online.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="touch-target w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
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
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-700">
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
