import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2 } from 'lucide-react';
import axios from 'axios';
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onUploadComplete: (text: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData);
            if (response.data.text) {
                onUploadComplete(response.data.text);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Attach File"
                className={cn(
                    "rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                    isUploading && "opacity-50"
                )}
            >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Paperclip className="h-4 w-4" />
                )}
            </Button>
        </>
    );
}
