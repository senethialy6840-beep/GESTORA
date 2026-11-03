"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Lock, Sparkles, CheckCircle2, ArrowRight, Shield, ArrowLeft,
  Box, Calculator, Users2, FileText, Truck, BarChart3, Zap
} from 'lucide-react';
import { LockedFeatureDetails, PLAN_DISPLAY_NAMES } from '@/lib/planAccess';

interface PlanLockedFeatureProps {
  feature: LockedFeatureDetails;
  currentPlan?: string;
}

export function PlanLockedFeature({ feature, currentPlan = 'STARTUP' }: PlanLockedFeatureProps) {
  const isEnterprise = feature.requiredPlan === 'ENTERPRISE';
  const currentPlanDisplay = PLAN_DISPLAY_NAMES[currentPlan?.toUpperCase()] || currentPlan;
  const requiredPlanDisplay = PLAN_DISPLAY_NAMES[feature.requiredPlan] || feature.requiredPlan;

  const renderIcon = () => {
    const iconClass = "w-10 h-10";
    switch (feature.key) {
      case 'inventory':
        return <Box className={iconClass} />;
      case 'invoices':
        return <FileText className={iconClass} />;
      case 'purchases':
        return <Truck className={iconClass} />;
      case 'reports':
        return <BarChart3 className={iconClass} />;
      case 'accounting':
        return <Calculator className={iconClass} />;
      case 'hr':
        return <Users2 className={iconClass} />;
      case 'ai':
        return <Sparkles className={iconClass} />;
      default:
        return <Lock className={iconClass} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
        </Link>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
          Votre forfait : <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">{currentPlanDisplay}</span>
        </span>
      </div>

      {/* Main Locked Card */}
      <div className="bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 sm:p-10 shadow-sm transition-colors duration-300 relative overflow-hidden">
        
        {/* Decorative ambient gradients */}
        <div className={`absolute top-0 right-0 w-80 h-80 ${isEnterprise ? 'bg-purple-500/10' : 'bg-emerald-500/10'} rounded-full blur-3xl pointer-events-none -mr-20 -mt-20`} />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          
          {/* Badge & Lock Icon */}
          <div className="flex flex-col items-center justify-center">
            <div className={`relative mb-4 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 ${
              isEnterprise 
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20' 
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20'
            }`}>
              {renderIcon()}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#162032] shadow-sm">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isEnterprise 
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }">
              <Lock className="w-3.5 h-3.5" />
              Fonctionnalité réservée au forfait {requiredPlanDisplay}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {feature.title}
            </h1>

            <p className="text-gray-500 dark:text-slate-400 text-base sm:text-lg mt-2 max-w-2xl leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="text-left mt-8 pt-8 border-t border-gray-100 dark:border-slate-800/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-4 text-center">
              Ce que vous débloquez avec le forfait {requiredPlanDisplay}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feature.benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="flex items-start p-4 rounded-xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                    isEnterprise 
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300' 
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison / Upgrade Callout */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/subscription"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                isEnterprise 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <span>Débloquer avec le forfait {requiredPlanDisplay}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-center"
            >
              Retourner au tableau de bord
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 pt-2">
            Activation instantanée dès confirmation de paiement. Aucune perte de données de votre compte actuel.
          </p>

        </div>
      </div>
    </div>
  );
}

