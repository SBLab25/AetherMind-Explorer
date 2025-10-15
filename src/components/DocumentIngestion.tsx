import { useState, useRef } from "react";
import { Upload, FileText, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface Document {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "embedding" | "indexed" | "error";
  progress: number;
  chunks?: number;
  error?: string;
}

export function DocumentIngestion() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
        });
        continue;
      }

      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      };

      setDocuments((prev) => [...prev, newDoc]);
      processDocument(file, newDoc.id);
    }
  };

  const processDocument = async (file: File, docId: string) => {
    setIsProcessing(true);

    try {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, status: "uploading", progress: 30 } : doc
        )
      );

      const formData = new FormData();
      formData.append("file", file);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, status: "embedding", progress: 60 } : doc
        )
      );

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.detail || `Upload failed with ${res.status}`);
      }

      const result = await res.json();

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: "indexed",
                progress: 100,
                chunks: result.chunks,
              }
            : doc
        )
      );

      toast({
        title: "Document indexed",
        description: `${file.name} processed with ${result.chunks} chunks`,
      });
    } catch (error: any) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: "error",
                progress: 0,
                error: error.message || "Processing failed",
              }
            : doc
        )
      );

      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error.message || "Failed to process document",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({ title: "Document removed", description: "Removed from session list" });
  };

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks || 0), 0);

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold gradient-text">Documents</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="w-4 h-4" />
          <span>{totalChunks} chunks</span>
        </div>
      </div>

      <Card
        className="glass border-dashed border-2 border-primary/30 hover:border-primary/50 transition-all cursor-pointer p-8"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.md"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">Drop files or click to browse</p>
            <p className="text-sm text-muted-foreground">TXT/PDF/MD files (max 10MB)</p>
          </div>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Card className="glass p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.size / 1024).toFixed(1)} KB
                          {doc.chunks && ` • ${doc.chunks} chunks`}
                        </p>
                      </div>
                      {doc.status === 'indexed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {doc.status !== 'indexed' && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`capitalize ${doc.status === 'error' ? 'text-destructive' : 'text-primary'}`}>
                            {doc.status}
                          </span>
                          {doc.status !== 'error' && <span>{doc.progress}%</span>}
                        </div>
                        {doc.status !== 'error' && <Progress value={doc.progress} className="h-1" />}
                        {doc.error && (
                          <p className="text-xs text-destructive">{doc.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}