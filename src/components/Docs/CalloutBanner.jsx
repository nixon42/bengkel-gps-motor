import React from 'react';
import { Lightbulb, Info, AlertTriangle } from 'lucide-react';

export default function CalloutBanner({ type = 'tip', title, content, children, className = '' }) {
  const configs = {
    tip: {
      border: 'border-emerald-300 dark:border-emerald-700',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-950 dark:text-emerald-100',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200',
      icon: Lightbulb,
      defaultTitle: 'Tips Cepat'
    },
    note: {
      border: 'border-blue-300 dark:border-blue-700',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-950 dark:text-blue-100',
      iconText: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
      icon: Info,
      defaultTitle: 'Catatan Penting'
    },
    warning: {
      border: 'border-amber-300 dark:border-amber-700',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-950 dark:text-amber-100',
      iconText: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
      icon: AlertTriangle,
      defaultTitle: 'Peringatan Operasional'
    }
  };

  const config = configs[type] || configs.tip;
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      role="region"
      aria-label={displayTitle}
      className={`rounded border ${config.border} ${config.bg} p-4 sm:p-5 my-4 transition-colors ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-1.5 rounded ${config.badgeBg} shrink-0 mt-0.5`}>
          <Icon className={`w-5 h-5 ${config.iconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold ${config.text} mb-1 flex items-center space-x-2`}>
            <span>{displayTitle}</span>
          </h4>
          {content && (
            <p className={`text-xs sm:text-sm ${config.text} leading-relaxed`}>
              {content}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
