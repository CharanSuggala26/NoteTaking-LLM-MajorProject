import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles, User, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

export default function Chat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your notes.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Add user message
        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input; // capture for closure
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: currentInput }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch response');
            }

            const data = await response.json();

            // Add assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || "Something went wrong connecting to the server."}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto w-full relative">

            {/* Header */}
            <header className="flex-none p-4 md:p-6 border-b border-border/30 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg leading-tight">AI Knowledge Assistant</h1>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs">Online & Ready</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-6 pb-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar - Assistant */}
                                {msg.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1 border border-border">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                    </div>
                                )}

                                <div
                                    className={`relative px-5 py-3.5 shadow-sm max-w-[85%] md:max-w-[75%] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                                            : 'bg-card border border-border/60 text-foreground rounded-2xl rounded-tl-sm'
                                        }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="markdown prose prose-sm dark:prose-invert">
                                            {/* Just displaying raw text nicely, or could interpret markdown if needed */}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>

                                {/* Avatar - User */}
                                {msg.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="h-4 w-4 text-secondary-foreground" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 justify-start"
                        >
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1 border border-border">
                                <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                            </div>
                            <div className="bg-card border border-border/60 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-[52px]">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-6 pb-8 backdrop-blur-md bg-transparent">
                <div className="relative max-w-3xl mx-auto">
                    <div className="relative flex items-center">
                        <Button
                            className="absolute left-2 h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            variant="ghost"
                        >
                            <Sparkles className="h-4 w-4" />
                        </Button>
                        <input
                            className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-transparent focus:border-border rounded-full py-4 pl-12 pr-12 text-sm outline-none shadow-sm transition-all"
                            placeholder="Ask me anything about your notes..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <Button
                            className={`absolute right-2 rounded-full h-9 w-9 p-0 transition-transform ${input.trim() ? 'scale-100' : 'scale-90 opacity-70'}`}
                            size="icon"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-muted-foreground/60">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
