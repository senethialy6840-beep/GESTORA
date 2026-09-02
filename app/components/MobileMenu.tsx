"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden ml-4 flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-[#0A1226] border-b border-gray-100 dark:border-slate-800 shadow-xl py-6 px-6 flex flex-col space-y-6 z-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Menu</span>
            <ThemeToggle />
          </div>
          
          <Link 
            href="#fonctionnalites" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            Fonctionnalités
          </Link>
          <hr className="border-gray-100 dark:border-slate-800" />
          <Link 
            href="#tarification" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            Tarification
          </Link>
          <hr className="border-gray-100 dark:border-slate-800" />
          <Link 
            href="#faq" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            FAQ
          </Link>
          <hr className="border-gray-100 dark:border-slate-800" />
          <Link 
            href="#support" 
            onClick={() => setIsOpen(false)} 
            className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            Contactez-nous
          </Link>
          <Link 
            href="/register" 
            onClick={() => setIsOpen(false)} 
            className="px-6 py-3 bg-[#2563EB] text-white rounded-full font-bold text-center hover:bg-blue-600 transition-colors shadow-md mt-4"
          >
            Commencer
          </Link>
        </div>
      )}
    </div>
  );
}
