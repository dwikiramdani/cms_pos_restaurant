import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Menu', href: '/menu', icon: ClipboardDocumentListIcon },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Kitchen', href: '/kitchen', icon: FireIcon },
  { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Branches', href: '/branches', icon: BuildingStorefrontIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-japanese-white">
      <div
        className={`fixed inset-0 z-50 bg-japanese-charcoal/50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-japanese-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-japanese-gray">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-japanese-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-japanese-charcoal">RestaurantPOS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-japanese-gray"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-japanese-gray">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-japanese-red rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-japanese-charcoal">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-japanese-red hover:bg-japanese-red/10 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b border-japanese-gray lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-japanese-gray"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
