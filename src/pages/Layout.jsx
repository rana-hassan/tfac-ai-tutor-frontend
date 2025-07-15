
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  MessageCircle,
  Settings,
  User as UserIcon,
  Menu,
  X,
  Brain,
  Sparkles
} from "lucide-react";
import SkipLink from "./components/accessibility/SkipLink";
import PWAPrompt from "./components/chat/PWAPrompt";
import ErrorBoundary from "./components/errors/ErrorBoundary";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navItems = [
    { name: "Home", icon: Home, path: "Index" },
    { name: "Chat", icon: MessageCircle, path: "Chat" },
  ];

  const isCurrentPage = (pageName) => {
    return currentPageName === pageName || location.pathname === createPageUrl(pageName);
  };

  const renderSimpleHeader = () => (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={createPageUrl("Index")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TutorAI</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-slate-900">
                  {user.full_name}
                </div>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="User menu"
                >
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <div className="px-3 py-2">
                      <div className="text-sm font-medium">{user.full_name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );

  // Onboarding and FirstLesson pages should be scrollable with simplified header
  if (currentPageName === 'Onboarding' || currentPageName === 'FirstLesson') {
    return (
      <>
        <SkipLink />
        <ErrorBoundary>
          <div className="min-h-screen bg-slate-50">
            {renderSimpleHeader()}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </ErrorBoundary>
        <PWAPrompt />
      </>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // All pages (including Index) use the main layout, which has a fixed viewport
  return (
    <ErrorBoundary>
       <style jsx global>{`
          html, body {
            height: 100%;
            overflow: hidden;
          }
        `}</style>
      <div className="flex flex-col h-screen bg-slate-50">
        <SkipLink />
        
        {/* Sticky Header with backdrop-blur effect */}
        <motion.header 
          className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 z-50 flex-shrink-0 h-16"
          role="banner"
          data-testid="main-header"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to={createPageUrl("Index")} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">TutorAI</span>
                {user?.rpg_stats?.level > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Level {user.rpg_stats.level}
                  </Badge>
                )}
              </Link>

              {/* Desktop Navigation - Only 2 items */}
              <div className="hidden md:block">
                <NavigationMenu>
                  <NavigationMenuList className="flex gap-1">
                    {navItems.map((item) => (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={createPageUrl(item.path)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              isCurrentPage(item.path)
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                            aria-current={isCurrentPage(item.path) ? 'page' : undefined}
                          >
                            <item.icon className="w-4 h-4" aria-hidden="true" />
                            {item.name}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                {user && (
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {user.full_name}
                    </div>
                    {user.rpg_stats?.total_xp > 0 && (
                      <div className="text-xs text-slate-500">
                        {user.rpg_stats.total_xp} XP
                      </div>
                    )}
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="User menu"
                    >
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {user && (
                      <>
                        <div className="px-3 py-2">
                          <div className="text-sm font-medium">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Settings")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMenuOpen}
                  data-testid="header-menu"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation - Only Home and Chat */}
            {isMenuOpen && (
              <div className="md:hidden py-3 border-t border-slate-200">
                <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.path)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isCurrentPage(item.path)
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isCurrentPage(item.path) ? 'page' : undefined}
                    >
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </motion.header>

        {/* Main Content wrapper - Conditional styling for Index page */}
        {currentPageName === 'Index' ? (
          <div className="flex-1 min-h-0">{children}</div>
        ) : (
          <div className="flex-1 overflow-y-auto" id="main-content" tabIndex="-1">
            {children}
          </div>
        )}

        {/* PWA Install Prompt */}
        <PWAPrompt />
      </div>
    </ErrorBoundary>
  );
}
