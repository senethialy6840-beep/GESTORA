import { Bell, Package, ShoppingCart, Info } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, title: 'Rupture de stock imminente', text: 'Le produit "MacBook Pro M2" a atteint son seuil d\'alerte (restant : 2).', time: 'Il y a 5 min', icon: <Package className="w-5 h-5 text-red-400" />, bg: 'bg-red-500/10' },
    { id: 2, title: 'Nouvelle commande', text: 'Commande #CMD-8492 validée (150.000 FCFA).', time: 'Il y a 2 heures', icon: <ShoppingCart className="w-5 h-5 text-green-400" />, bg: 'bg-green-500/10' },
    { id: 3, title: 'Mise à jour système', text: 'La version 1.2.0 de GESTORA est maintenant disponible.', time: 'Hier', icon: <Info className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Toutes les notifications</h1>
        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Tout marquer comme lu</button>
      </div>
      
      <div className="bg-[#162032] border border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-4 border-b border-slate-700/50 flex items-start hover:bg-slate-800/50 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${notif.bg}`}>
              {notif.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold mb-1">{notif.title}</h4>
              <p className="text-slate-400 text-sm mb-2">{notif.text}</p>
              <span className="text-xs text-slate-500">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
