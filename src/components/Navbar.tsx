import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  History,
  ShoppingBag,
  Settings,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/resume-history', icon: History },
    { name: 'Shop', path: '/shop', icon: ShoppingBag, highlight: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer group min-w-0"
          onClick={() => navigate('/dashboard')}
        >
          <img src="/logo.png" alt="Job Ready" className="h-11 w-auto max-w-[170px] sm:max-w-[220px] object-contain" />
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 rounded-lg ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : item.highlight
                    ? 'text-orange-600 hover:bg-orange-50 font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className={`h-4 w-4 ${item.highlight && !isActive(item.path) ? 'animate-pulse-slow' : ''}`} />
              {item.name}
              {item.highlight && !isActive(item.path) && (
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse ml-1" />
              )}
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-primary/10 hover:ring-2 ring-primary/20 transition-all">
                <div className="bg-gradient-to-br from-primary/10 to-primary/30 h-full w-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-xl shadow-strong border-primary/10 animate-in fade-in zoom-in-95">
              <DropdownMenuLabel className="font-poppins px-2 py-1.5">
                <div className="flex flex-col">
                  <span className="font-bold">{user?.full_name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/5" />
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="rounded-lg cursor-pointer focus:bg-primary/5 py-2.5"
              >
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
                <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground opacity-50" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="rounded-lg cursor-pointer focus:bg-destructive/5 text-destructive py-2.5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;