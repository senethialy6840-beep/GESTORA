"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User } from "lucide-react";
import { analyzeQueryAction } from '@/app/actions/aiActions';
import { useSession } from 'next-auth/react';

export default function AIPage() {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, isTyping?: boolean }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const userName = session?.user?.name || 'Utilisateur';

  const suggestions = [
    "Quels sont mes produits les plus rentables ?",
    "Analyse ma trésorerie du mois",
    "Que dois-je réapprovisionner en priorité ?",
    "Comment se porte l'entreprise ?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isAiTyping || !session?.user?.companyId) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsAiTyping(true);

    // Initial delay before AI starts "typing"
    await new Promise(resolve => setTimeout(resolve, 400));

    const fullResponse = await analyzeQueryAction(text, session.user.companyId, userName);
    
    // Add empty assistant message with typing flag
    setMessages(prev => [...prev, { role: 'assistant', text: '', isTyping: true }]);

    // Typing effect simulation
    let currentText = '';
    const chunkSize = 2; // characters per tick to make it fast enough but visible
    
    for (let i = 0; i < fullResponse.length; i += chunkSize) {
      currentText += fullResponse.substring(i, i + chunkSize);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', text: currentText, isTyping: true };
        return newMsgs;
      });
      await new Promise(resolve => setTimeout(resolve, 15)); // 15ms per chunk
    }

    // Finalize typing
    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = { role: 'assistant', text: fullResponse, isTyping: false };
      return newMsgs;
    });
    
    setIsAiTyping(false);
  };

  // Helper function to render markdown-like formatting (bold and lists)
  const renderMessage = (text: string, isTyping?: boolean) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (!line) return <div key={i} className="h-2"></div>;
          
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}
        {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
      
      {/* HEADER */}
      <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-900/50">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-500 mr-2" />
            GESTORA AI
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            Votre Directeur Financier Virtuel.
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="p-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour'} {userName ? `${userName} ` : ''}! Comment puis-je vous aider ?
              </h2>
              <p className="text-gray-500 dark:text-slate-400">
                Je suis connecté à toutes vos données en temps réel. Posez-moi une question sur vos ventes, vos stocks ou votre trésorerie.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {suggestions.map((text, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(text)}
                  className="p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all text-left group"
                >
                  <span className="text-blue-600 dark:text-blue-400 mr-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 pb-4">
            
            {/* SUGGESTIONS ALWAYS VISIBLE */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 dark:border-slate-800/60 pb-6">
              {suggestions.map((text, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(text)}
                  disabled={isAiTyping}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-left disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                    {msg.role === 'assistant' ? 'GESTORA AI' : 'Vous'}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {msg.role === 'assistant' ? renderMessage(msg.text, msg.isTyping) : (
                      <p className="text-[15px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 p-4 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-slate-800/60">
        <div className="max-w-3xl mx-auto relative flex items-end shadow-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <textarea 
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(inputValue);
              }
            }}
            placeholder="Écrivez votre message à GESTORA AI..."
            className="flex-1 max-h-32 bg-transparent px-4 py-3.5 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none resize-none"
            style={{ minHeight: '52px' }}
          ></textarea>
          <div className="p-2 shrink-0">
            <button 
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isAiTyping}
              className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim() && !isAiTyping 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-400 dark:text-slate-500">
          GESTORA AI peut faire des erreurs. Pensez à vérifier les informations importantes.
        </div>
      </div>

    </div>
  );
}
