import { z } from "zod";

// --- Authentification ---

export const EmailSchema = z.object({
  email: z.string().email("Veuillez fournir une adresse email valide."),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Le token est requis."),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const RegisterUserSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  entreprise: z.string().min(2, "Le nom de l'entreprise est requis."),
  email: z.string().email("Veuillez fournir une adresse email valide."),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

// --- Paramètres / Entreprise ---

export const SettingsSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis."),
  companyId: z.string().optional(),
  address: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Email invalide.")]).optional(),
  phone: z.string().optional(),
  logo: z.any().optional(), // On ne peut pas facilement valider un fichier/base64 de façon basique sans check complexe
});
