import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, ArrowRight, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const API_URL = 'http://localhost:5000/api/notes';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: async () => {
            const { data } = await axios.get(API_URL);
            return data as Note[];
        }
    });

    const totalNotes = notes?.length || 0;
    const recentNotes = notes?.slice(0, 5) || [];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-8 max-w-6xl mx-auto"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
                </div>
                <Button onClick={() => navigate('/notes')} size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                    <Plus className="mr-2 h-5 w-5" /> New Note
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Knowledge</CardTitle>
                            <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300 opacity-70" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            ) : (
                                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalNotes}</div>
                            )}
                            <p className="text-xs text-blue-600/80 dark:text-blue-400 mt-1">Notes in your second brain</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Interactions</CardTitle>
                            <Sparkles className="h-4 w-4 text-purple-700 dark:text-purple-300 opacity-70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">Ready</div>
                            <p className="text-xs text-purple-600/80 dark:text-purple-400 mt-1">Chat assistant online</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed" onClick={() => navigate('/notes')}>
                        <CardContent className="flex flex-col items-center justify-center h-full py-6 text-center space-y-2">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <Plus className="h-5 w-5 text-foreground" />
                            </div>
                            <div className="font-medium">Create New</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Notes List */}
            <Card className="md:col-span-3 border-none shadow-md bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest captured thoughts.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs group" onClick={() => navigate('/notes')}>
                            View All <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : recentNotes.length > 0 ? (
                        <div className="space-y-1">
                            {recentNotes.map((note) => (
                                <Link key={note._id} to="/notes" className="group block">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1 overflow-hidden">
                                                <p className="font-medium leading-none truncate group-hover:text-primary transition-colors">{note.title}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-2">
                                            {note.updatedAt ? format(new Date(note.updatedAt), 'MMM d') : 'Recently'}
                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl m-2">
                            <p className="text-sm text-muted-foreground mb-4">
                                Your dashboard is empty.
                            </p>
                            <Button size="sm" onClick={() => navigate('/notes')}>
                                Start Writing
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
