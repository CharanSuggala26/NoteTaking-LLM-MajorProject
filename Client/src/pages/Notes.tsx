import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Loader2, Trash2, Pencil, Mic } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Input } from "@/components/ui/input";
import { MindMapDialog } from "@/components/MindMapDialog";
import { PodcastDialog } from "@/components/PodcastDialog";
import { FileUpload } from "@/components/FileUpload";

// API Base URL
const API_URL = 'http://localhost:5000/api/notes';

interface Note {
    _id: string;
    title: string;
    content: string;
    tags: string[];
}

export default function Notes() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const queryClient = useQueryClient();

    // Fetch Notes
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
        setIsCreating(true); // Open the form area
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
                {!isCreating && !editingNote && (
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Note
                    </Button>
                )}
            </div>

            {(isCreating || editingNote) && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>{editingNote ? "Edit Note" : "Create New Note"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Note Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Start typing or record..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <VoiceRecorder onTranscriptionComplete={handleTranscription} />
                                <FileUpload onUploadComplete={handleFileUpload} />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                                <Button onClick={handleSubmit} disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {editingNote ? "Update Note" : "Save Note"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notes?.map((note) => (
                        <Card key={note._id} className="flex flex-col hover:shadow-md transition-shadow group relative">
                            <CardHeader className="pb-2 relative">
                                <CardTitle className="text-lg pr-12">{note.title}</CardTitle>
                                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-background/80 rounded-md backdrop-blur-sm p-1">
                                    {/* Mind Map Button */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <MindMapDialog
                                            noteId={note._id}
                                            content={note.content}
                                        />
                                    </div>
                                    {/* Podcast Button */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <PodcastDialog
                                            noteId={note._id}
                                            title={note.title}
                                            content={note.content}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-purple-500" title="Listen to Podcast">
                                                    <Mic className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); startEditing(note); }}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this note?")) {
                                            deleteNoteMutation.mutate(note._id);
                                        }
                                    }}>
                                        {deleteNoteMutation.isPending && deleteNoteMutation.variables === note._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                                    {note.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <div className="flex flex-wrap gap-2">
                                    {note.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                                            <Tag className="mr-1 h-3 w-3" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                    {notes?.length === 0 && !isLoading && (
                        <div className="col-span-full text-center text-muted-foreground py-8">
                            No notes found. Create your first note!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
