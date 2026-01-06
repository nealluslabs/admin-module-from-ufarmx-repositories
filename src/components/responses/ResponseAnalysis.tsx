import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalysisMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ResponseAnalysisProps {
    analysis: AnalysisMessage[];
    onSendMessage: (message: string) => Promise<void>;
    onClearChat: () => Promise<void>;
    isLoading: boolean;
}

export function ResponseAnalysis({ analysis, onSendMessage, onClearChat, isLoading }: ResponseAnalysisProps) {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [analysis]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const msg = input;
        setInput('');
        await onSendMessage(msg);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="flex flex-col h-[600px] lg:h-[calc(100vh-10rem)]">
            <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                        <CardTitle className="text-base">AI Analysis</CardTitle>
                        <p className="text-xs text-muted-foreground">Ask questions about this response</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClearChat} title="Clear Chat">
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {analysis.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                            <Bot className="w-12 h-12 mb-2 opacity-20" />
                            <p>No analysis yet.</p>
                            <p className="text-sm">Ask a question to start analyzing this response.</p>
                        </div>
                    )}

                    {analysis.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={cn("rounded-lg p-3 text-sm whitespace-pre-wrap",
                                msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none")}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 animate-pulse">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-muted rounded-lg p-3 rounded-tl-none">
                                <div className="flex gap-1 h-full items-center">
                                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t mt-auto">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ask something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
