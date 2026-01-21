import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    PenTool,
    LayoutDashboard,
    Settings,
    Search,
    User,
    ChevronLeft,
    Menu,
    Disc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const routes = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/notes", label: "Notes", icon: PenTool },
        { path: "/chat", label: "AI Assistant", icon: MessageSquare },
    ];

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={cn(
                    "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out font-sans",
                    className,
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
                )}
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 h-16 border-b border-border/40">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 font-bold text-xl tracking-tight"
                        >
                            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                                <Disc className="h-4 w-4 text-primary-foreground animate-spin-slow" />
                            </div>
                            <span>Neuron</span>
                        </motion.div>
                    )}
                    {isCollapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                                <Disc className="h-4 w-4 text-primary-foreground" />
                            </div>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex ml-auto h-6 w-6 text-muted-foreground"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>

                {/* Search (Simplified for UI only) */}
                <div className="p-4">
                    {!isCollapsed ? (
                        <div className="relative group">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <input
                                className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border-none rounded-md py-2 pl-9 pr-4 text-sm outline-none ring-1 ring-transparent focus:ring-primary transition-all placeholder:text-muted-foreground/70"
                                placeholder="Search..."
                            />
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" className="w-full">
                            <Search className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 flex flex-col gap-1 px-3">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = location.pathname === route.path || (route.path === '/notes' && location.pathname === '/kanban');
                        return (
                            <Link
                                key={route.path}
                                to={route.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {route.label}
                                    </motion.span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / Profile */}
                <div className="p-4 mt-auto border-t border-border/40">
                    <button className={cn(
                        "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left",
                        isCollapsed && "justify-center px-0"
                    )}>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-background">
                            <User className="h-4 w-4" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Student User</p>
                                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                            </div>
                        )}
                        {!isCollapsed && <Settings className="h-4 w-4 text-muted-foreground" />}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

// Helper for spin animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;
document.head.appendChild(style);
