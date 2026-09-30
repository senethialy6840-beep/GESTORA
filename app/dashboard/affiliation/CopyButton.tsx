"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center px-4 py-3 bg-gray-900 dark:bg-slate-800 hover:bg-gray-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
    >
      {copied ? <Check className="w-5 h-5 mr-2 text-emerald-400" /> : <Copy className="w-5 h-5 mr-2" />}
      {copied ? 'Copié !' : 'Copier'}
    </button>
  );
}
