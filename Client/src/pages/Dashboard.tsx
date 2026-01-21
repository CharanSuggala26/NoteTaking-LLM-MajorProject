import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, ArrowRight } from "lucide-react";

// API URL - duplicated for now, ideal to move to a config/constants file
const API_URL = 'http://localhost:5000/api/notes';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function Dashboard() {
    const navigate = useNavigate();

    // Fetch Notes for dashboard stats
    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes'], // Should match key in Notes.tsx to share cache
        queryFn: async () => {
            const { data } = await axios.get(API_URL);
            return data as Note[];
        }
    });

    const totalNotes = notes?.length || 0;
    const recentNotes = notes?.slice(0, 5) || []; // Top 5 recent

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Button onClick={() => navigate('/notes')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Note
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className="text-2xl font-bold">{totalNotes}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Stored in Knowledge Base</p>
                    </CardContent>
                </Card>
                {/* Add more metrics here if needed, e.g. Favorites, Tags count */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentNotes.length > 0 ? (
                            <div className="space-y-4">
                                {recentNotes.map((note) => (
                                    <div key={note._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{note.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                                                {note.content}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    You haven't created any notes yet.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => navigate('/notes')}>
                                    Start Writing <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
