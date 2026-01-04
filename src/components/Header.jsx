import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  TrendingUp, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  ChevronRight, 
  Sun, 
  Moon,
  Menu,
  X,
  Search,
  Calculator,
  Grid3X3
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Header = ({ toggleTheme, theme }) => {
  const urlSet = new Set(["/login", "/google/callback"]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const menuItems = [
    { label: 'Settings', icon: Settings, path: '/settings', show: !!user },
    { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', show: user?.role === 'ADMIN' },
  ];

  const bottomNavItems = [
    { label: 'Home', path: '/', icon: TrendingUp },
    { label: 'Screener', path: '/strategies', icon: Grid3X3 },
    { label: 'Calc', path: '/calculator', icon: Calculator },
    { label: 'Heatmap', path: '/heatmap', icon: Search },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter md:text-2xl">
              SHAHBAZ<span className="text-primary">TRADES</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative h-7 w-13 rounded-full bg-muted border border-border p-1 transition-colors hover:bg-accent focus:outline-none"
              aria-label="Toggle theme"
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm"
              >
                {theme === 'dark' ? (
                  <Moon className="h-3 w-3 text-white" />
                ) : (
                  <Sun className="h-3 w-3 text-white" />
                )}
              </motion.div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link 
                    to="/settings" 
                    className="px-3 py-2 text-sm font-semibold hover:text-primary transition-colors"
                  >
                    Settings
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="px-3 py-2 text-sm font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-4 py-1.5 text-sm font-semibold text-destructive border border-destructive/20 rounded-full hover:bg-destructive hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                !urlSet.has(location.pathname) && (
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Login
                  </Link>
                )
              )}
            </nav>

            {/* Mobile Profile/Menu Trigger */}
            <div className="md:hidden">
              <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Dialog.Trigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-md overflow-hidden">
                    {user?.profile ? (
                      <img src={user.profile} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      user?.name?.[0] || user?.email?.[0] || <Menu className="h-5 w-5" />
                    )}
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                  <Dialog.Content className="fixed bottom-0 right-0 top-0 z-50 w-[280px] bg-background p-6 shadow-2xl transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right rounded-l-3xl flex flex-col">
                    <div className="flex justify-end mb-4">
                      <Dialog.Close asChild>
                        <button className="rounded-full p-2 hover:bg-muted transition-colors">
                          <X className="h-6 w-6" />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className="text-center mb-8">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-black shadow-xl overflow-hidden">
                        {user?.profile ? (
                          <img src={user.profile} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                        ) : (
                          user?.name?.[0] || user?.email?.[0] || 'U'
                        )}
                      </div>
                      <Dialog.Title className="text-xl font-extrabold tracking-tight">
                        {user ? (user.name || user.email.split('@')[0]) : 'Guest'}
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-muted-foreground mt-1">
                        {user ? user.role : 'Welcome to Shahbaz Trades'}
                      </Dialog.Description>
                    </div>

                    <div className="h-px bg-border mb-6" />

                    <div className="flex-grow space-y-1">
                      {menuItems.filter(item => item.show).map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setDrawerOpen(false);
                          }}
                          className="flex w-full items-center justify-between p-3 rounded-xl transition-colors hover:bg-primary/10 group"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-base">{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto">
                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-white transition-all"
                        >
                          <LogOut className="h-5 w-5" />
                          Logout
                        </button>
                      ) : (
                        !urlSet.has(location.pathname) && (
                          <Link
                            to="/login"
                            onClick={() => setDrawerOpen(false)}
                            className="flex w-full items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                          >
                            <LogIn className="h-5 w-5" />
                            Login
                          </Link>
                        )
                      )}
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <nav className="flex items-center justify-around h-16 rounded-3xl border border-border bg-background/80 backdrop-blur-xl shadow-2xl px-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all duration-300 px-3",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] font-bold tracking-tight",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Header;