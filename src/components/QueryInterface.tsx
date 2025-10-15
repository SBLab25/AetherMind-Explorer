import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  sources?: string[];
}

interface QuerySettings {
  model?: string;
  top_k?: number;
}

interface QueryInterfaceProps {
  settings?: QuerySettings;
}

export function QueryInterface({ settings }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: currentQuery,
          model: settings?.model || "groq-llama3.3",
          top_k: settings?.top_k || 10,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.detail || `Query failed with ${res.status}`);
      }

      const result = await res.json();

      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: "assistant",
        content: result.answer,
        metadata: {
          model: result.model_used,
          chunks: result.chunks_found,
        },
        sources: result.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      if ((result.chunks_found || 0) === 0) {
        toast({
          title: "No relevant documents found",
          description: "Try uploading documents or rephrasing your query",
        });
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: "assistant",
          content: error.message || "Query failed",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass p-4 h-full flex flex-col">
      <div
        ref={messagesContainerRef}
        className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[70vh]"
      >
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <div className={m.type === 'user' ? 'font-medium' : ''}>{m.content}</div>
            {m.sources && m.sources.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">Sources: {m.sources.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-3 mt-3 border-t">
        <Input
          value={query}
          placeholder="Ask a question about your documents..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Thinking..." : "Ask"}
        </Button>
      </div>
    </Card>
  );
}