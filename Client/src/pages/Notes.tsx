import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Loader2, Trash2, Pencil, Mic, Sparkles, X, Filter } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Input } from "@/components/ui/input";
import { MindMapDialog } from "@/components/MindMapDialog";
import { PodcastDialog } from "@/components/PodcastDialog";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// API Base URL
const API_URL = 'http://localhost:5000/api/notes';

interface Note {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    updatedAt?: string;
}

export default function Notes() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const queryClient = useQueryClient();

    // Fetch Notes - UI ONLY: Added select sort logic locally if backend doesn't, but assuming backend does
    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: async () => {
            const { data } = await axios.get(API_URL);
            return data as Note[];
        }
    });

    // Create Note Mutation
    const createNoteMutation = useMutation({
        mutationFn: async (newNote: { title: string; content: string; tags: string[] }) => {
            return await axios.post(API_URL, newNote);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            resetForm();
        }
    });

    // Update Note Mutation
    const updateNoteMutation = useMutation({
        mutationFn: async (updatedNote: { id: string; title: string; content: string; tags: string[] }) => {
            return await axios.put(`${API_URL}/${updatedNote.id}`, {
                title: updatedNote.title,
                content: updatedNote.content,
                tags: updatedNote.tags
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            resetForm();
        }
    });

    // Delete Note Mutation
    const deleteNoteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await axios.delete(`${API_URL}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
    });

    const resetForm = () => {
        setIsCreating(false);
        setEditingNote(null);
        setTitle("");
        setContent("");
    };

    const handleTranscription = (text: string) => {
        setContent((prev) => prev + (prev ? " " : "") + text);
    };

    const handleFileUpload = (text: string) => {
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
    };

    const handleSubmit = () => {
        if (!title || !content) return;

        if (editingNote) {
            updateNoteMutation.mutate({
                id: editingNote._id,
                title,
                content,
                tags: editingNote.tags
            });
        } else {
            createNoteMutation.mutate({
                title,
                content,
                tags: []
            });
        }
    };

    const startEditing = (note: Note) => {
        setEditingNote(note);
        setTitle(note.title);
        setContent(note.content);
        setIsCreating(true);
    };

    const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

    // UI: Editor Dialog
    const isEditorOpen = isCreating || !!editingNote;
    const closeEditor = () => resetForm();

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        My Notes
                    </h1>
                    <p className="text-muted-foreground mt-1">Capture ideas, generate insights.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button onClick={() => setIsCreating(true)} className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> New Note
                    </Button>
                </div>
            </div>

            {/* Note Grid */}
            {isLoading ? (
                <div className="flex justify-center p-20">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading your knowledge base...</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {notes?.map((note, i) => (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                layout
                            >
                                <Card className="group relative h-full flex flex-col border border-border/50 hover:border-primary/50 bg-card hover:bg-accent/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                                    {/* Hover Actions Overlay */}
                                    <div className="absolute top-3 right-3 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1 bg-background/95 backdrop-blur-sm p-1 rounded-full shadow-sm z-10 border">

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <MindMapDialog
                                                noteId={note._id}
                                                content={note.content}
                                            />
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <PodcastDialog
                                                noteId={note._id}
                                                title={note.title}
                                                content={note.content}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-purple-500 rounded-full" title="AI Podcast">
                                                        <Mic className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                        </div>

                                        <div className="w-[1px] h-4 bg-border/60 mx-1 self-center" />

                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full" onClick={(e) => { e.stopPropagation(); startEditing(note); }}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this note?")) deleteNoteMutation.mutate(note._id);
                                        }}>
                                            {deleteNoteMutation.isPending && deleteNoteMutation.variables === note._id ?
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                                                <Trash2 className="h-3.5 w-3.5" />
                                            }
                                        </Button>
                                    </div>

                                    <CardHeader className="pb-3 pt-5 px-5">
                                        <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">{note.title}</CardTitle>
                                        <div className="text-xs text-muted-foreground">
                                            {/* Mock date if not provided by backend, UI fix only */}
                                            {note.updatedAt ? format(new Date(note.updatedAt), 'MMM d, yyyy') : 'Recently updated'}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-grow px-5 pb-2">
                                        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap leading-relaxed">
                                            {note.content}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="px-5 pb-5 pt-3 mt-auto">
                                        <div className="flex flex-wrap gap-2 w-full">
                                            {note.tags && note.tags.length > 0 ? note.tags.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 h-5 font-normal bg-secondary/50 text-secondary-foreground">
                                                    <Tag className="mr-1 h-3 w-3 opacity-50" /> {tag}
                                                </Badge>
                                            )) : (
                                                <span className="text-[10px] text-muted-foreground/40 italic">No tags</span>
                                            )}
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {notes?.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-medium">No notes yet</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                                Create your first note to start building your personal knowledge base.
                            </p>
                            <Button variant="outline" className="mt-6" onClick={() => setIsCreating(true)}>
                                Create Note
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Note Editor Dialog (Replaces inline expansion for cleaner UI) */}
            <Dialog open={isEditorOpen} onOpenChange={(open) => !open && closeEditor()}>
                <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-md">

                    {/* Toolbar / Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                {editingNote ? "Editing Note" : "Drafting"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="h-8" onClick={closeEditor}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isPending} className="h-8 px-6">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {editingNote ? "Save Changes" : "Create Note"}
                            </Button>
                        </div>
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className="flex-1 flex flex-col h-full bg-background relative">
                            {/* Title Input */}
                            <div className="px-8 pt-8 pb-4">
                                <Input
                                    className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40 h-auto bg-transparent"
                                    placeholder="Untitled Note"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Content Textarea */}
                            <ScrollArea className="flex-1 px-8 pb-8">
                                <textarea
                                    className="w-full h-full min-h-[400px] resize-none border-none bg-transparent focus:outline-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/30"
                                    placeholder="Start typing deeply..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </ScrollArea>

                            {/* Floating Action Bar */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-background/80 backdrop-blur border rounded-full shadow-lg hover:scale-105 transition-transform">
                                <VoiceRecorder onTranscriptionComplete={handleTranscription} />
                                <div className="w-[1px] h-4 bg-border" />
                                <FileUpload onUploadComplete={handleFileUpload} />
                            </div>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
}
