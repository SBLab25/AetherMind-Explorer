import { useState } from "react";
import { History, Pin, Trash2, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  isPinned: boolean;
}

export function ChatHistory({ onSettingsClick }: { onSettingsClick: () => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "1",
      query: "What are the main findings in the research paper?",
      timestamp: new Date(Date.now() - 3600000),
      isPinned: true,
    },
    {
      id: "2",
      query: "Summarize the methodology section",
      timestamp: new Date(Date.now() - 7200000),
      isPinned: false,
    },
  ]);

  const togglePin = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
  };

  const removeItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const exportChat = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.json";
    a.click();
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold gradient-text">History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onSettingsClick} className="glass">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="glass p-4 hover:glass-strong transition-all cursor-pointer group">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.query}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item.id);
                      }}
                    >
                      <Pin
                        className={`w-4 h-4 ${item.isPinned ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-2">
        <Button variant="outline" className="w-full glass" onClick={exportChat}>
          <Download className="w-4 h-4 mr-2" />
          Export Chat
        </Button>
        <Button
          variant="outline"
          className="w-full glass"
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>
    </div>
  );
}