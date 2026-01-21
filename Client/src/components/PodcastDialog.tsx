import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Play, Square, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScriptLine {
    speaker: string;
    text: string;
}

interface PodcastDialogProps {
    noteId?: string;
    title?: string;
    content?: string;
    trigger?: React.ReactNode;
}

export function PodcastDialog({ title, content, trigger }: PodcastDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [script, setScript] = useState<ScriptLine[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // TTS Refs
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isPlayingRef = useRef(false); // To handle async callbacks safely

    // Initialize TTS
    useEffect(() => {
        synthRef.current = window.speechSynthesis;
        const loadVoices = () => {
            voicesRef.current = synthRef.current?.getVoices() || [];
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            stopPlayback();
        };
    }, []);

    const stopPlayback = () => {
        // Reset Ref first to prevent onend from triggering next line
        isPlayingRef.current = false;

        if (synthRef.current) {
            // Cancel any ongoing speech
            synthRef.current.cancel();
        }

        setIsPlaying(false);
        setCurrentIndex(-1);
        currentUtteranceRef.current = null;
    };

    const generateScript = async () => {
        if (!content) return;

        setIsLoading(true);
        stopPlayback();
        setScript([]);

        try {
            const response = await axios.post('http://localhost:5000/api/podcast/generate', {
                title,
                content
            });
            if (response.data.script) {
                setScript(response.data.script);
            }
        } catch (error) {
            console.error("Failed to generate podcast", error);
        } finally {
            setIsLoading(false);
        }
    };

    const playPodcast = () => {
        if (!script.length) return;

        // Ensure any previous playback is fully stopped
        stopPlayback();

        // Small timeout to allow browser to reset TTS state
        setTimeout(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
            setCurrentIndex(0);
            speakLine(0);
        }, 100);
    };

    const speakLine = (index: number) => {
        // Check if we should still be playing
        if (!isPlayingRef.current) return;

        if (index >= script.length) {
            stopPlayback();
            return;
        }

        const line = script[index];
        setCurrentIndex(index);

        const utterance = new SpeechSynthesisUtterance(line.text);
        currentUtteranceRef.current = utterance;

        // Assign Voices
        const voices = voicesRef.current;
        let voice = voices[0];

        if (voices.length > 1) {
            const uniqueSpeakers = Array.from(new Set(script.map(s => s.speaker)));
            const speakerIndex = uniqueSpeakers.indexOf(line.speaker);

            if (speakerIndex === 1 && voices.length > 4) {
                voice = voices[4];
            } else if (speakerIndex === 1) {
                voice = voices[1];
            }
        }

        if (voice) utterance.voice = voice;
        utterance.rate = 1.1;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            // Only continue if we are still marked as playing
            if (isPlayingRef.current) {
                // Small delay between speakers feels more natural and avoids race conditions
                setTimeout(() => speakLine(index + 1), 200);
            }
        };

        utterance.onerror = (e) => {
            console.error("Speech Error", e);

            // "interrupted" error happens when we cancel; we should ignore it if we intended to stop
            if (e.error === 'interrupted') {
                return;
            }

            // For other errors, try to skip to next line
            if (isPlayingRef.current) {
                setTimeout(() => speakLine(index + 1), 200);
            }
        };

        synthRef.current?.speak(utterance);
    };

    // Auto-generate on open if empty
    useEffect(() => {
        if (isOpen && script.length === 0 && !isLoading) {
            generateScript();
        }
    }, [isOpen]);

    // Handle Closing Dialog
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            stopPlayback();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Mic className="mr-2 h-4 w-4" /> Podcast
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>AI Podcast</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-slate-50 border rounded-md p-4 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-white/80 backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Writing script...</p>
                        </div>
                    ) : script.length > 0 ? (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                {script.map((line, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg border transition-all duration-300 ${currentIndex === idx
                                                ? 'bg-primary/10 border-primary scale-102 shadow-md'
                                                : 'bg-white border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx % 2 === 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {line.speaker.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-sm text-slate-700">{line.speaker}</span>
                                        </div>
                                        <p className="text-slate-600 pl-10 leading-relaxed text-sm">
                                            {line.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No script generated yet.
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="ghost" onClick={generateScript} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
                    </Button>

                    {isPlaying ? (
                        <Button variant="destructive" onClick={stopPlayback}>
                            <Square className="mr-2 h-4 w-4 fill-current" /> Stop
                        </Button>
                    ) : (
                        <Button onClick={playPodcast} disabled={isLoading || script.length === 0} className="w-32">
                            <Play className="mr-2 h-4 w-4 fill-current" /> Play
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
