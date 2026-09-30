"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      // Si on n'a pas déjà un referral code, ou si on veut permettre son remplacement,
      // on peut l'enregistrer. Mais le prompt demande : 
      // "Le premier commercial qui attribue un prospect doit rester propriétaire.
      // Si un prospect arrive avec MOUSSA01 puis revient avec AWA02, ne pas remplacer."
      const existingRef = localStorage.getItem('gestora_ref');
      if (!existingRef) {
        localStorage.setItem('gestora_ref', ref);
      }
    }
  }, [searchParams]);

  return null;
}
