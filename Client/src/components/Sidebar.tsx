import {
    Link
} from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, PenTool, LayoutDashboard } from "lucide-react";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Note App
                    </h2>
                    <div className="space-y-1">
                        <Link to="/dashboard" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link to="/kanban" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <PenTool className="mr-2 h-4 w-4" />
                            Notes
                        </Link>
                        <Link to="/chat" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat Assistant
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
