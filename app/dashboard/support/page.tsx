"use client";

import React from 'react';
import Link from 'next/link';
import { 
  HelpCircle, Mail, Phone, MessageCircle, 
  FileText, Video, LifeBuoy, Users, ChevronRight, BookOpen, Globe
} from 'lucide-react';

export default function SupportPage() {
  const teamMembers = [
    {
      name: "Support Technique",
      role: "Problèmes techniques & Bugs",
      email: "tech@gestora.sn",
      phone: "+221 77 000 00 01",
      avatar: "T"
    },
    {
      name: "Service Client",
      role: "Questions générales & Facturation",
      email: "contact@gestora.sn",
      phone: "+221 77 000 00 02",
      avatar: "C"
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Aide et Assistance</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Comment pouvons-nous vous aider aujourd'hui ?</p>
        </div>
        <Link 
          href="/dashboard/support/contact"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <Mail className="w-5 h-5" />
          Contacter le support
        </Link>
      </div>

      {/* QUICK CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="#" className="bg-white dark:bg-[#162032] p-6 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Base de connaissances</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Trouvez des tutoriels et des articles détaillés sur l'utilisation de GESTORA.</p>
          <div className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            Parcourir les articles <ChevronRight className="w-4 h-4" />
          </div>
        </a>

        <a href="#" className="bg-white dark:bg-[#162032] p-6 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tutoriels vidéo</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Apprenez à maîtriser GESTORA en quelques minutes grâce à nos vidéos.</p>
          <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            Voir les vidéos <ChevronRight className="w-4 h-4" />
          </div>
        </a>

        <Link href="/dashboard/support/faq" className="bg-white dark:bg-[#162032] p-6 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">FAQ</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Les réponses aux questions les plus fréquemment posées par nos utilisateurs.</p>
          <div className="text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            Consulter la FAQ <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* TEAM SECTION */}
      <div className="bg-white dark:bg-[#162032] rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notre équipe à votre écoute</h2>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Contactez le département approprié pour obtenir une réponse rapide et précise.
          </p>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
          {teamMembers.map((member, index) => (
            <div key={index} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{member.role}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={`mailto:${member.email}`} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors text-sm font-medium border border-gray-200 dark:border-slate-700"
                >
                  <Mail className="w-4 h-4" /> {member.email}
                </a>
                <a 
                  href={`tel:${member.phone.replace(/\s+/g, '')}`} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors text-sm font-medium border border-gray-200 dark:border-slate-700"
                >
                  <Phone className="w-4 h-4" /> {member.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="bg-[#162032] rounded-2xl p-6 text-white relative overflow-hidden group max-w-2xl">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white">Réseaux Sociaux</h3>
          </div>
          <p className="text-slate-300 text-sm mb-6">
            Suivez-nous pour ne rien manquer de nos nouveautés, astuces et mises à jour.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
              </svg>
            </a>
            <a href="#" className="w-12 h-12 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
            <a href="#" className="w-12 h-12 rounded-full bg-white/10 hover:bg-gray-800 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M448 209.91a210.06 210.06 0 01-122.77-39.25v178.72A162.55 162.55 0 11185 188.31v89.89a74.62 74.62 0 1052.23 71.18V0h88a121.18 121.18 0 001.86 22.17A122.18 122.18 0 00381 102.39a121.43 121.43 0 0067 20.14z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
