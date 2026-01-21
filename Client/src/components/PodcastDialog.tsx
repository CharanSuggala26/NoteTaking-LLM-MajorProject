import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Play, Square, RefreshCw, AudioWaveform } from 'lucide-react';
import axios from 'axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';

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
    const isPlayingRef = useRef(false);

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
        isPlayingRef.current = false;
        if (synthRef.current) {
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
        stopPlayback();
        setTimeout(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
            setCurrentIndex(0);
            speakLine(0);
        }, 100);
    };

    const speakLine = (index: number) => {
        if (!isPlayingRef.current) return;

        if (index >= script.length) {
            stopPlayback();
            return;
        }

        const line = script[index];
        setCurrentIndex(index);

        const utterance = new SpeechSynthesisUtterance(line.text);
        currentUtteranceRef.current = utterance;

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
            if (isPlayingRef.current) {
                setTimeout(() => speakLine(index + 1), 200);
            }
        };

        utterance.onerror = (e) => {
            if (e.error === 'interrupted') return;
            if (isPlayingRef.current) {
                setTimeout(() => speakLine(index + 1), 200);
            }
        };

        synthRef.current?.speak(utterance);
    };

    useEffect(() => {
        if (isOpen && script.length === 0 && !isLoading) {
            generateScript();
        }
    }, [isOpen]);

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
                    <Button variant="outline" size="sm" className="rounded-full">
                        <Mic className="mr-2 h-4 w-4" /> Podcast
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-muted/20">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                            <AudioWaveform className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        </div>
                        Audio Summary
                    </DialogTitle>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                            {isPlaying && (
                                <span className="flex h-2 w-2 relative mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-background/60 backdrop-blur-sm"
                            >
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                <p className="text-sm text-muted-foreground animate-pulse">Generating script...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {script.length > 0 ? (
                        <ScrollArea className="h-full px-6 py-4">
                            <div className="space-y-6 pb-6">
                                {script.map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border shadow-sm ${idx % 2 === 0 ? 'bg-white border-blue-200 text-blue-600' : 'bg-white border-green-200 text-green-600'
                                            }`}>
                                            {line.speaker.charAt(0)}
                                        </div>

                                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed border shadow-sm transition-all duration-300 ${currentIndex === idx
                                                ? 'bg-primary text-primary-foreground scale-[1.02] ring-2 ring-primary/20'
                                                : 'bg-card text-card-foreground border-border/50'
                                            } ${idx % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'
                                            }`}>
                                            <p className="font-semibold text-xs opacity-70 mb-1">{line.speaker}</p>
                                            {line.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : !isLoading && (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No script available.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-background/50 backdrop-blur flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={generateScript} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
                        <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Regenerate
                    </Button>

                    {isPlaying ? (
                        <Button variant="destructive" onClick={stopPlayback} className="w-32 rounded-full shadow-lg hover:shadow-red-500/20 transition-all">
                            <Square className="mr-2 h-4 w-4 fill-current" /> Stop
                        </Button>
                    ) : (
                        <Button onClick={playPodcast} disabled={isLoading || script.length === 0} className="w-32 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all bg-purple-600 hover:bg-purple-700 text-white border-none">
                            <Play className="mr-2 h-4 w-4 fill-current" /> Play
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
