import { Home, PieChart, MessageSquare } from "lucide-react";

interface TabNavigationProps {
  activeTab: 'upload' | 'dashboard' | 'chat';
  onTabChange: (tab: 'upload' | 'dashboard' | 'chat') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'upload', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-6 py-4 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}