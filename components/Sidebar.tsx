import { Home, Upload, Settings, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'rules', label: 'Rules', icon: ListFilter },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeItem = 'dashboard', onNavigate }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Expense Tracker</h2>
        <p className="text-sm text-gray-600 mt-1">Multi-year Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Expense Tracker
        </div>
      </div>
    </div>
  );
}
