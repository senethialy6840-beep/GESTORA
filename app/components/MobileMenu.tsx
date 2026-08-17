"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden ml-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-6 flex flex-col space-y-6 z-50">
          <Link 
            href="#fonctionnalites" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 hover:text-[#2563EB] transition-colors"
          >
            Fonctionnalités
          </Link>
          <hr className="border-gray-100" />
          <Link 
            href="#support" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 hover:text-[#2563EB] transition-colors"
          >
            Contactez-nous
          </Link>
          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)} 
            className="px-6 py-3 bg-[#0A1226] text-white rounded-full font-bold text-center hover:bg-slate-800 transition-colors shadow-md mt-4"
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  );
}
