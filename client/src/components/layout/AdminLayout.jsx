import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Sparkles, Image, Mail, MessageSquare, User, LogOut, ArrowLeft, Settings, LayoutDashboard, Calendar, Award, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Services', href: '/admin/services', icon: Sparkles },
    { name: 'Gallery', href: '/admin/gallery', icon: Image },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Certificates', href: '/admin/certificates', icon: Award },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Website Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#fcfaf8]">
      
      {/* MOBILE HEADER BAR */}
      <div className="flex h-16 w-full items-center justify-between border-b border-dark-100 bg-white px-4 md:hidden fixed top-20 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-dark-600 hover:bg-dark-50"
        >
          <Menu size={24} />
        </button>
        <span className="font-playfair text-lg font-bold tracking-widest text-dark-900">
          ADMIN PANEL
        </span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
          {user?.photo ? (
            <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-primary-500" />
          )}
        </div>
      </div>

      {/* SIDEBAR ON DESKTOP & SLIDE DRAWER ON MOBILE */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#18181b] text-white transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header section of Sidebar */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2 text-primary-light hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-sans text-xs uppercase tracking-widest font-semibold">View Website</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-300 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info panel in Sidebar */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-white/10 bg-white/5">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 border border-primary/40 flex-shrink-0">
            {user?.photo ? (
              <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-light">
                <User size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-playfair font-semibold tracking-wide text-white">
              {user?.username || 'Ankita'}
            </p>
            <p className="truncate text-xs text-gray-300">
              {user?.email || 'ankitamakeup@gmail.com'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm tracking-wider font-sans transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-white font-semibold shadow-md shadow-primary/30' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white font-normal'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area with Logout Action */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-sans tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE VIEW */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      {/* MAIN VIEWPORT LAYOUT */}
      <div className="flex-1 flex flex-col md:h-screen md:overflow-y-auto pt-16 md:pt-0">
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
