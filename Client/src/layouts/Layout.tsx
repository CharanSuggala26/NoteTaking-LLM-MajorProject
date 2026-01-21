import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export function Layout() {
    return (
        <div className="flex h-screen w-full bg-background text-foreground font-sans antialiased overflow-hidden selection:bg-primary/20">
            {/* Sidebar is fixed/static based on screen size handled internally */}
            <Sidebar className="hidden md:flex flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Background Pattern (Subtle) */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />

                <main className="flex-1 overflow-y-auto w-full relative z-10 scroll-smooth">
                    <div className="container mx-auto p-4 md:p-8 lg:p-12 max-w-7xl pb-20 md:pb-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
