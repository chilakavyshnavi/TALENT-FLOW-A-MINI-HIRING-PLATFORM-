import { useState } from 'react';
import { 
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[#f0f0f0]">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 flex z-40 md:hidden',
        sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}>
        <div className={clsx(
          'fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        )} onClick={() => setSidebarOpen(false)} />
        
        <div className={clsx(
          'relative flex-1 flex flex-col max-w-xs w-full transform transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
          
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content with spacing */}
      <div className="flex flex-col flex-1 overflow-hidden ml-1">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-border shadow-sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none mr-4 mb-4 mt-4">
          <div className="bg-white rounded-lg border border-border h-full">
            <div className="p-6 h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
