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

// --- Produits ---

export const ProductSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis."),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix ne peut pas être négatif."),
  cost: z.coerce.number().min(0, "Le coût ne peut pas être négatif."),
  stock: z.coerce.number().min(0, "Le stock ne peut pas être négatif."),
  stockAlert: z.coerce.number().optional().default(0),
  companyId: z.string().min(1, "Company ID requis."),
});

// --- Clients ---

export const CustomerSchema = z.object({
  name: z.string().min(2, "Le nom du client est requis."),
  email: z.union([z.literal(""), z.string().email("Email invalide.")]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  mensualite: z.coerce.number().optional().default(0),
  balance: z.coerce.number().optional().default(0),
  companyId: z.string().min(1, "Company ID requis."),
});

// --- Transactions (Factures, Achats, Ventes) ---

export const SaleItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().min(1, "Quantité >= 1"),
  price: z.coerce.number().min(0, "Prix invalide"),
  productId: z.string().optional()
});

export const SaleSchema = z.object({
  invoiceNo: z.string().min(1, "Numéro de facture requis"),
  totalAmount: z.coerce.number().min(0, "Montant invalide"),
  status: z.string().optional(),
  customerId: z.string().optional(),
  companyId: z.string().min(1, "Company ID requis"),
  items: z.array(SaleItemSchema).optional()
});

export const SupplierSchema = z.object({
  name: z.string().min(1, "Le nom du fournisseur est requis"),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyId: z.string().min(1, "Company ID requis")
});

export const PurchaseItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().min(1, "Quantité >= 1"),
  price: z.coerce.number().min(0, "Prix invalide")
});

export const PurchaseSchema = z.object({
  supplierId: z.string().min(1, "Fournisseur requis"),
  totalAmount: z.coerce.number().min(0, "Montant invalide"),
  status: z.string().optional(),
  companyId: z.string().min(1, "Company ID requis")
});
