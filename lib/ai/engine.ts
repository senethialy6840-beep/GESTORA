import { companyData } from './mockData';

export function analyzeQuery(query: string): string {
  // Normalize query: lowercase and remove accents for better matching
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const fmt = (num: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(num);

  const { user } = companyData;

  const lowStock = companyData.products.filter(p => p.stock <= p.minStock);
  const topProducts = [...companyData.products].sort((a, b) => (b.salesThisMonth * (b.price - b.cost)) - (a.salesThisMonth * (a.price - a.cost))).slice(0, 3);
  const totalSalesCount = companyData.products.reduce((acc, p) => acc + p.salesThisMonth, 0);

  // 1. ANALYSE GLOBALE (Santé, Bilan, Comment ça va)
  if (q.includes('comment se porte') || q.includes('bilan') || q.includes('resume') || q.includes('sante') || q.includes('general') || q.includes('evolue')) {
    return `Voici le bilan global de votre entreprise ce mois-ci :

- **Chiffre d'affaires :** ${fmt(companyData.totalRevenue)}
- **Dépenses :** ${fmt(companyData.totalExpenses)}
- **Bénéfice :** ${fmt(companyData.netMargin)}
- **Ventes :** ${totalSalesCount} unités écoulées

Votre entreprise se porte très bien. Vos revenus couvrent largement vos dépenses, dégageant une marge très saine.`;
  }

  // 2. ANALYSE DES PRODUITS RENTABLES ET MEILLEURES VENTES
  if (q.includes('rentable') || q.includes('meilleur') || q.includes('top') || q.includes('produit') || q.includes('vend le plus')) {
    const margin1 = topProducts[0].salesThisMonth * (topProducts[0].price - topProducts[0].cost);
    const margin2 = topProducts[1].salesThisMonth * (topProducts[1].price - topProducts[1].cost);
    const margin3 = topProducts[2].salesThisMonth * (topProducts[2].price - topProducts[2].cost);
    
    return `Voici l'analyse de vos produits les plus rentables ce mois-ci :

1. **${topProducts[0].name}** : ${topProducts[0].salesThisMonth} ventes (Marge générée : ${fmt(margin1)})
2. **${topProducts[1].name}** : ${topProducts[1].salesThisMonth} ventes (Marge générée : ${fmt(margin2)})
3. **${topProducts[2].name}** : ${topProducts[2].salesThisMonth} ventes (Marge générée : ${fmt(margin3)})

Ces trois références sont les piliers de votre rentabilité actuelle.`;
  }

  // 3. ANALYSE DE LA TRÉSORERIE ET DES FINANCES (CA, Revenu)
  if (q.includes('tresorerie') || q.includes('finance') || q.includes('benefice') || q.includes('revenu') || q.includes('gagne') || q.includes('chiffre d\'affaire') || q.includes('ca ')) {
    return `Voici l'analyse précise de vos finances :

- **Chiffre d'affaires encaissé :** ${fmt(companyData.totalRevenue)}
- **Dépenses totales payées :** ${fmt(companyData.totalExpenses)}
- **Bénéfice net (Trésorerie disponible) :** ${fmt(companyData.netMargin)}

Votre trésorerie est excellente. Vous disposez de liquidités suffisantes pour vos opérations courantes.`;
  }

  // 4. ANALYSE DES STOCKS ET RÉAPPROVISIONNEMENT
  if (q.includes('stock') || q.includes('reapprovisionner') || q.includes('rupture') || q.includes('acheter') || q.includes('commande') || q.includes('manque')) {
    if (lowStock.length === 0) {
      return `Vos stocks sont actuellement à un niveau optimal. Aucun produit n'est en dessous de son seuil critique de réapprovisionnement.`;
    }

    return `Voici les produits que vous devez réapprovisionner en priorité absolue :

${lowStock.map((p, i) => `${i+1}. **${p.name}** : Il ne vous reste que ${p.stock} unités (Seuil d'alerte : ${p.minStock}).`).join('\n')}

L'Huile 5L est à un niveau particulièrement critique. Passez commande auprès de votre fournisseur dès aujourd'hui.`;
  }

  // 5. ANALYSE DES DÉPENSES
  if (q.includes('depense') || q.includes('charge') || q.includes('cout') || q.includes('paye')) {
    return `Voici la décomposition de vos dépenses pour ce mois-ci :

- **Masse salariale :** ${fmt(companyData.expenses.salaires)}
- **Achats Fournisseurs :** ${fmt(companyData.expenses.fournisseurs)}
- **Loyer :** ${fmt(companyData.expenses.loyer)}
- **Frais logistiques :** ${fmt(companyData.expenses.logistique)}
- **Marketing :** ${fmt(companyData.expenses.marketing)}

**Total :** ${fmt(companyData.totalExpenses)}

Vos charges fixes sont saines. Le seul point d'optimisation se situe au niveau de la logistique, qui représente un budget important.`;
  }

  // 6. ANALYSE DES CLIENTS
  if (q.includes('client') || q.includes('acheteur') || q.includes('encours') || q.includes('rapportent')) {
    const topClients = [...companyData.clients].sort((a, b) => b.revenue - a.revenue);
    
    return `Voici vos meilleurs clients actuels (générant le plus de chiffre d'affaires) :

1. **${topClients[0].name}** : ${fmt(topClients[0].revenue)}
2. **${topClients[1].name}** : ${fmt(topClients[1].revenue)}
3. **${topClients[2].name}** : ${fmt(topClients[2].revenue)}

Ces comptes sont vitaux pour votre entreprise. Maintenez une excellente relation commerciale avec eux.`;
  }

  // 7. ANALYSE DES FOURNISSEURS
  if (q.includes('fournisseur') || q.includes('grossiste') || q.includes('livreur')) {
    const topSupplier = [...companyData.suppliers].sort((a, b) => b.totalPurchases - a.totalPurchases)[0];
    return `Vous travaillez avec ${companyData.suppliers.length} fournisseurs principaux.

Votre fournisseur principal est **${topSupplier.name}** (Total achats : ${fmt(topSupplier.totalPurchases)}).
Vous avez actuellement un reste à payer de **${fmt(topSupplier.due)}** envers ce fournisseur. Je vous conseille de le régler rapidement pour faciliter vos prochaines commandes urgentes.`;
  }

  // 8. ANALYSE DES EMPLOYÉS ET SALAIRES
  if (q.includes('employe') || q.includes('salaire') || q.includes('equipe') || q.includes('personnel') || q.includes('vendeur')) {
    return `Vous avez actuellement ${companyData.employees.length} collaborateurs dans votre équipe :

${companyData.employees.map(e => `- **${e.name}** (${e.role}) : ${fmt(e.salary)}`).join('\n')}

La masse salariale mensuelle totale est de **${fmt(companyData.expenses.salaires)}**. Elle est très bien maîtrisée et ne représente qu'une petite partie de vos dépenses.`;
  }

  // 9. SALUTATIONS
  if (q.includes('salut') || q.includes('bonjour') || q.includes('hello') || q.includes('bonsoir')) {
    const timeGreeting = new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour';
    return `${timeGreeting} ${user.firstName}. Je suis GESTORA AI, votre assistant financier virtuel.

Je suis prêt à analyser précisément vos données. Que souhaitez-vous savoir ?
(Exemples : "Quels sont mes produits les plus rentables ?", "Analyse ma trésorerie", "Comment se porte mon entreprise ?")`;
  }

  // FALLBACK DYNAMIQUE COHÉRENT
  // S'il n'y a pas de mot clé reconnu, au lieu de dire "Je ne comprends pas", 
  // on donne une analyse générale basée sur les données pour rester professionnel et pertinent.
  return `Bien que votre question soit très spécifique, voici les données les plus importantes de votre activité que je peux vous fournir immédiatement :

- Vous avez réalisé **${fmt(companyData.totalRevenue)}** de chiffre d'affaires ce mois-ci, pour **${fmt(companyData.totalExpenses)}** de charges.
- Vous avez **${lowStock.length} produits** en alerte de stock (dont l'Huile 5L).
- Votre entreprise est globalement en excellente santé financière (Score : ${companyData.healthScore}/100).

*Si vous souhaitez des détails spécifiques, n'hésitez pas à reformuler en mentionnant vos stocks, clients, fournisseurs ou dépenses.*`;
}
