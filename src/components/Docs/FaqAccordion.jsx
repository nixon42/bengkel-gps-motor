import React, { useState } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2, Lightbulb } from 'lucide-react';

export default function FaqAccordion({ faqs = [], className = '' }) {
  // Allow opening multiple or single items; default open the first FAQ item
  const [openMap, setOpenMap] = useState({ 'faq-stock-discrepancy': true });

  const toggle = (id) => {
    setOpenMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!faqs || faqs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Tidak ada FAQ yang cocok dengan pencarian Anda.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {faqs.map((faq, index) => {
        const isOpen = !!openMap[faq.id];
        return (
          <div
            key={faq.id || index}
            id={faq.id}
            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-colors"
          >
            {/* Header / Toggle Button: strictly >= 44x44px touch target */}
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.id}`}
              className="touch-target w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between space-x-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  Q{index + 1}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                    {faq.category || 'Operasional Bengkel'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.question}
                  </h3>
                </div>
              </div>
              <div className="p-1 rounded bg-slate-100 dark:bg-slate-700 shrink-0 ml-2">
                <ChevronDown 
                  className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </button>

            {/* Content Drawer */}
            {isOpen && (
              <div 
                id={`faq-answer-${faq.id}`}
                className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3"
              >
                <p className="leading-relaxed font-medium">
                  {faq.answer}
                </p>

                {faq.steps && faq.steps.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Langkah-langkah Penyelesaian:</span>
                    </div>
                    <ol className="space-y-1.5 pl-5 list-decimal text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {faq.steps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {faq.tip && (
                  <div className="flex items-start space-x-2 p-2.5 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Tips Praktis:</strong> {faq.tip}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
