
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Users, label: 'Candidates', path: '/candidates' },
    { icon: ClipboardList, label: 'Assessments', path: '/assessments' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 h-screen flex flex-col bg-[#f0f0f0]">
      {/* Header with Logo */}
      <div className="px-2 py-4">
        <Link to="/" className="block">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#1f1687] radient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900 leading-tight">Talent Flow</h1>
                  <p className="text-xs text-gray-500 leading-tight">hello@talentflow.com</p>
                </div>
              </div>
              <div className="flex flex-col space-y-0">
                <ChevronUp className="h-3 w-3 text-gray-400" />
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Line underneath */}
        <div className="border-t border-gray-200 mt-4"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center justify-start px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
                  ${active 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                  }
                `}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  active ? 'text-gray-700' : 'text-gray-500'
                }`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer with Sign Out and Copyright */}
      <div className="px-4 pb-4">
        {/* Copyright Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Talent flow
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;