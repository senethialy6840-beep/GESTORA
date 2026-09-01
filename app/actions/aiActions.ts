"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function analyzeQueryAction(query: string, _companyId: string, userName: string) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) return "Non autorisé";
    const companyId = session.user.companyId as string;
    
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const fmt = (num: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(num);

    // Fetch real data from DB
    const [
      products,
      sales,
      salesItems,
      customers,
      suppliers,
      employees,
      accounting
    ] = await Promise.all([
      prisma.product.findMany({ where: { companyId } }),
      prisma.sale.findMany({ where: { companyId } }),
      prisma.saleItem.findMany({ where: { sale: { companyId } } }),
      prisma.customer.findMany({ where: { companyId } }),
      prisma.supplier.findMany({ where: { companyId }, include: { purchases: true } }),
      prisma.employee.findMany({ where: { companyId } }),
      prisma.accountingTransaction.findMany({ where: { companyId } })
    ]);

    // Compute basic stats
    let totalRevenue = 0;
    sales.forEach(s => totalRevenue += s.totalAmount);
    
    let totalExpenses = 0;
    accounting.filter(a => a.type === 'EXPENSE').forEach(a => totalExpenses += a.amount);
    
    const netMargin = totalRevenue - totalExpenses;
    
    const lowStock = products.filter(p => p.stock <= (p.stockAlert || 0));
    const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 3); // simplistic top product logic for now
    const totalSalesCount = salesItems.reduce((acc, item) => acc + item.quantity, 0);

    // 1. ANALYSE GLOBALE
    if (q.includes('comment se porte') || q.includes('bilan') || q.includes('resume') || q.includes('sante') || q.includes('general') || q.includes('evolue')) {
      return `Voici le bilan global de votre entreprise :

- **Chiffre d'affaires :** ${fmt(totalRevenue)}
- **Dépenses :** ${fmt(totalExpenses)}
- **Bénéfice :** ${fmt(netMargin)}
- **Ventes :** ${totalSalesCount} articles vendus

Votre entreprise se porte ${netMargin > 0 ? 'très bien' : 'avec difficulté'}. Vos revenus ${netMargin > 0 ? 'couvrent largement' : 'ne couvrent pas totalement'} vos dépenses.`;
    }

    // 2. ANALYSE DES PRODUITS RENTABLES
    if (q.includes('rentable') || q.includes('meilleur') || q.includes('top') || q.includes('produit') || q.includes('vend le plus')) {
      if (topProducts.length === 0) return "Vous n'avez pas encore de produits.";
      
      return `Voici l'analyse de vos produits les plus chers/rentables actuellement :

${topProducts.map((p, i) => `${i+1}. **${p.name}** : Prix de vente ${fmt(p.price)} (Marge unitaire : ${fmt(p.price - p.cost)})`).join('\n')}

Assurez-vous de maintenir ces produits en stock.`;
    }

    // 3. ANALYSE DE LA TRÉSORERIE ET DES FINANCES
    if (q.includes('tresorerie') || q.includes('finance') || q.includes('benefice') || q.includes('revenu') || q.includes('gagne') || q.includes('chiffre d\'affaire') || q.includes('ca ')) {
      return `Voici l'analyse précise de vos finances réelles :

- **Chiffre d'affaires total :** ${fmt(totalRevenue)}
- **Dépenses totales (Comptabilité) :** ${fmt(totalExpenses)}
- **Bénéfice net actuel :** ${fmt(netMargin)}

${netMargin > 0 ? 'Votre trésorerie est positive.' : 'Attention, votre trésorerie est dans le rouge.'}`;
    }

    // 4. ANALYSE DES STOCKS
    if (q.includes('stock') || q.includes('reapprovisionner') || q.includes('rupture') || q.includes('acheter') || q.includes('commande') || q.includes('manque')) {
      if (lowStock.length === 0) {
        return `Vos stocks sont actuellement à un niveau optimal. Aucun produit n'est en dessous de son seuil critique d'alerte.`;
      }

      return `Voici les produits que vous devez réapprovisionner en priorité absolue :

${lowStock.map((p, i) => `${i+1}. **${p.name}** : Il ne vous reste que ${p.stock} unités (Seuil d'alerte : ${p.stockAlert}).`).join('\n')}

Pensez à passer commande rapidement auprès de vos fournisseurs.`;
    }

    // 5. ANALYSE DES DÉPENSES
    if (q.includes('depense') || q.includes('charge') || q.includes('cout') || q.includes('paye')) {
      return `Voici vos dépenses totales enregistrées en comptabilité :

**Total :** ${fmt(totalExpenses)}

Vous pouvez consulter le module Comptabilité pour voir les détails par catégorie.`;
    }

    // 6. ANALYSE DES CLIENTS
    if (q.includes('client') || q.includes('acheteur') || q.includes('encours') || q.includes('rapportent')) {
      return `Vous avez actuellement **${customers.length} clients** enregistrés dans votre base de données.
Vous pouvez utiliser le module Clients pour voir leurs historiques d'achats détaillés.`;
    }

    // 7. ANALYSE DES FOURNISSEURS
    if (q.includes('fournisseur') || q.includes('grossiste') || q.includes('livreur')) {
      return `Vous travaillez avec **${suppliers.length} fournisseurs** enregistrés.
Allez dans le module Fournisseurs pour gérer vos bons de commande.`;
    }

    // 8. ANALYSE DES EMPLOYÉS
    if (q.includes('employe') || q.includes('salaire') || q.includes('equipe') || q.includes('personnel') || q.includes('vendeur')) {
      const salaries = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
      return `Vous avez actuellement ${employees.length} collaborateurs dans votre équipe.
La masse salariale enregistrée est de **${fmt(salaries)}**.`;
    }

    // 9. SALUTATIONS
    if (q.includes('salut') || q.includes('bonjour') || q.includes('hello') || q.includes('bonsoir')) {
      const timeGreeting = new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour';
      return `${timeGreeting} ${userName}. Je suis GESTORA AI, votre assistant connecté à votre base de données en temps réel.

Que souhaitez-vous analyser aujourd'hui ? (Stocks, Ventes, Clients...)`;
    }

    // FALLBACK
    return `Voici les données clés de votre entreprise à l'instant T :

- Chiffre d'affaires : **${fmt(totalRevenue)}**
- Charges : **${fmt(totalExpenses)}**
- **${lowStock.length} produits** sont actuellement en alerte de stock.
- Vous gérez **${products.length} références** au total.

*Si vous souhaitez une analyse plus poussée, posez-moi une question sur vos ventes ou vos stocks.*`;

  } catch (error) {
    return "Je suis désolé, une erreur technique m'empêche d'analyser vos données pour le moment.";
  }
}
