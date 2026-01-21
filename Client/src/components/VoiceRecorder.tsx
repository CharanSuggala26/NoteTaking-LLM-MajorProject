import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export function VoiceRecorder({ onTranscriptionComplete }: { onTranscriptionComplete: (text: string) => void }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        // If stopped listening and we have a transcript, send it up
        if (!listening && transcript) {
            handleStop();
        }
    }, [listening, transcript]);

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
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
        setIsProcessing(true);
        // Simulate "processing" or cleaning up text via LLM if needed
        // For now, we just pass the raw transcript
        setTimeout(() => {
            onTranscriptionComplete(transcript);
            setIsProcessing(false);
            resetTranscript();
        }, 500);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={listening ? "destructive" : "secondary"}
                size="icon"
                onClick={toggleRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : listening ? (
                    <MicOff className="h-4 w-4" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </Button>
            {listening && <span className="text-sm text-red-500 animate-pulse">Recording...</span>}
            {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
        </div>
    );
}
