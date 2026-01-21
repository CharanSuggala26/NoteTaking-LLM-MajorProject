import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { cn } from "@/lib/utils";

export function VoiceRecorder({ onTranscriptionComplete }: { onTranscriptionComplete: (text: string) => void }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (!listening && transcript) {
            handleStop();
        }
    }, [listening]);

    if (!browserSupportsSpeechRecognition) {
        return null; // Quietly hide if not supported
    }

    const toggleRecording = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    const handleStop = () => {
        if (!transcript) return;

        setIsProcessing(true);
        setTimeout(() => {
            onTranscriptionComplete(transcript);
            setIsProcessing(false);
            resetTranscript();
        }, 500);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={cn(
                "rounded-full transition-all duration-300",
                listening ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 scale-110" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={listening ? "Stop Recording" : "Start Dictation"}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : listening ? (
                <Square className="h-3 w-3 fill-current" />
            ) : (
                <Mic className="h-4 w-4" />
            )}
        </Button>
    );
}
