import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";

export default function Chat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your notes.' }
    ]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
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
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Chat Assistant</h1>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" /> Knowledge Base Chat
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <div className="p-4 border-t flex gap-2">
                    <Input
                        placeholder="Ask about your notes..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
