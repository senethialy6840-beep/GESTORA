"use client";

import React, { useState } from "react";
import { generateSasPayLink } from "@/app/actions/paymentActions";
import { CreditCard, Loader2 } from "lucide-react";

interface SasPayButtonProps {
  amount: number;
  reference: string;
  description: string;
  customerEmail?: string;
  className?: string;
}

export function SasPayButton({
  amount,
  reference,
  description,
  customerEmail,
  className = "",
}: SasPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await generateSasPayLink({
        amount,
        reference,
        description,
        customer_email: customerEmail,
      });

      if (response.success && response.paymentUrl) {
        // Redirection vers la page de paiement SasPay
        window.location.href = response.paymentUrl;
      } else {
        alert("Erreur: " + response.error);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || amount <= 0}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CreditCard className="w-5 h-5" />
      )}
      <span>{isLoading ? "Génération..." : "Payer avec SasPay"}</span>
    </button>
  );
}
