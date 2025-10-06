import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MenuItem, Role } from '../../types';
import {
  HomeIcon,
  BeakerIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  BellIcon,
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const navigation: MenuItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: false },
  { name: 'Medicines', href: '/medicines', icon: BeakerIcon, current: false },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon, current: false },
  { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon, current: false },
  { name: 'Usage Tracking', href: '/usage', icon: ChartPieIcon, current: false },
  { name: 'Alerts', href: '/alerts', icon: BellIcon, current: false },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, current: false },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    current: false,
    requiredRoles: [Role.ADMIN]
  },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredNavigation = navigation.filter(item => {
    if (!item.requiredRoles) return true;
    if (!user) return false;
    return item.requiredRoles.includes(user.roleName as Role);
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center h-16 bg-primary-600 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BeakerIcon className="h-8 w-8 text-white" />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-white">MediTrack</h2>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Collapse toggle button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-white hover:text-gray-200 transition-colors duration-150"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-6 w-6" />
                ) : (
                  <ChevronLeftIcon className="h-6 w-6" />
                )}
              </button>

              {!isCollapsed && (
                <button
                  type="button"
                  className="lg:hidden text-white hover:text-gray-200"
                  onClick={onClose}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center text-sm font-medium rounded-md transition-colors duration-150 ${
                    isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 border-r-2 border-primary-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isCollapsed ? '' : 'mr-3'
                    } ${
                      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`}
                  />
                  {!isCollapsed && item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.roleName}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;