// src/components/ai/OfflineFallback.jsx
import React from 'react';
import { t } from '../../i18n/index';

export default function OfflineFallback({ language }) {
  return (
    <div className="mx-4 mt-2 p-3 bg-amber-50 border-2 border-amber-600 rounded-lg">
      <p className="text-sm text-amber-700 font-medium">{t(language, 'offlineMode')}</p>
    </div>
  );
}
