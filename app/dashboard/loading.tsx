import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Chargement en cours...</p>
      </div>
    </div>
  );
}
