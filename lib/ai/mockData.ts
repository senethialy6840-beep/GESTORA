export const companyData = {
  // USER CONTEXT
  user: {
    firstName: "Mamadou",
    lastName: "Diop",
    role: "Administrateur",
    email: "mamadou@entreprise.com",
    language: "fr",
    timezone: "GMT"
  },
  
  // COMPANY CONTEXT
  name: "Dakar Business SARL",
  sector: "Commerce de détail et gros",
  country: "Sénégal",
  currency: "FCFA",
  
  // METRICS
  healthScore: 82,
  totalRevenue: 18750000,
  totalExpenses: 8400000,
  netMargin: 10350000,
  newClients: 25,
  
  // PRODUCTS
  products: [
    { name: "Riz 25kg", stock: 120, minStock: 50, price: 18500, cost: 15000, salesThisMonth: 320 },
    { name: "Huile 5L", stock: 6, minStock: 25, price: 6500, cost: 5000, salesThisMonth: 265 },
    { name: "Sucre 1kg", stock: 11, minStock: 40, price: 800, cost: 600, salesThisMonth: 200 },
    { name: "Lait 1L", stock: 85, minStock: 20, price: 1200, cost: 900, salesThisMonth: 189 },
    { name: "Savon", stock: 18, minStock: 50, price: 500, cost: 300, salesThisMonth: 150 },
    { name: "Café 250g", stock: 3, minStock: 20, price: 2500, cost: 1800, salesThisMonth: 45 },
    { name: "Pâtes 500g", stock: 300, minStock: 50, price: 600, cost: 400, salesThisMonth: 12 },
    { name: "Farine 5kg", stock: 45, minStock: 30, price: 3000, cost: 2200, salesThisMonth: 80 },
    { name: "Tomate concentrée", stock: 150, minStock: 100, price: 1000, cost: 700, salesThisMonth: 210 },
  ],
  
  // CLIENTS
  clients: [
    { name: "Boutique Ndiaye", revenue: 3240000, status: "Fidèle", lastPurchase: "2026-07-28" },
    { name: "Restaurant Le Baobab", revenue: 2110000, status: "Fidèle", lastPurchase: "2026-07-29" },
    { name: "Pharmacie Centrale", revenue: 1870000, status: "Actif", lastPurchase: "2026-07-25" },
    { name: "Alimentation Fatou", revenue: 1320000, status: "Actif", lastPurchase: "2026-07-30" },
    { name: "Supermarché Kébé", revenue: 850000, status: "Nouveau", lastPurchase: "2026-07-31" },
  ],
  
  // SUPPLIERS
  suppliers: [
    { name: "Grossiste Dakar", totalPurchases: 4500000, due: 500000 },
    { name: "Import Export SA", totalPurchases: 2100000, due: 0 },
    { name: "Agri Sénégal", totalPurchases: 1800000, due: 200000 },
  ],
  
  // EMPLOYEES
  employees: [
    { name: "Moussa Diouf", role: "Vendeur", salary: 150000 },
    { name: "Awa Fall", role: "Caissière", salary: 120000 },
    { name: "Ibrahima Sy", role: "Livreur", salary: 100000 },
  ],
  
  // EXPENSES
  expenses: {
    salaires: 3500000,
    loyer: 1200000,
    fournisseurs: 2500000,
    marketing: 500000,
    logistique: 700000,
  },
  
  // RECOMMENDATIONS
  recommendations: [
    { type: "urgent", title: "Rupture de stock imminente", desc: "4 produits sont sous le seuil d'alerte (Huile 5L, Sucre, Savon, Café)." },
    { type: "warning", title: "Produits à faible rotation", desc: "Le stock de Pâtes 500g est très élevé par rapport aux ventes récentes." },
    { type: "success", title: "Excellente marge sur le riz", desc: "Le Riz 25kg représente votre meilleure rentabilité ce mois-ci." },
  ]
};
