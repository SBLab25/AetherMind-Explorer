import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: (settings: any) => void;
}

export function SettingsDialog({ open, onOpenChange, onSettingsChange }: SettingsDialogProps) {
  const [topK, setTopK] = useState([10]);
  const [llmModel, setLlmModel] = useState("groq-llama3.3");
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleSave = () => {
    if (onSettingsChange) {
      onSettingsChange({
        model: llmModel,
        top_k: topK[0],
        reducedMotion,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Configure RAG pipeline, LLM parameters, and display preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rag" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rag">RAG</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="rag" className="space-y-6 mt-6">
            <Card className="glass p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Top-K Documents</Label>
                  <span className="text-sm text-muted-foreground">{topK[0]}</span>
                </div>
                <Slider
                  value={topK}
                  onValueChange={setTopK}
                  min={1}
                  max={20}
                  step={1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  Number of document chunks to retrieve for each query
                </p>
              </div>

              <div className="space-y-2">
                <Label>Embedding Model</Label>
                <Select value="all-MiniLM-L6-v2" disabled>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-MiniLM-L6-v2">
                      all-MiniLM-L6-v2 (384 dimensions)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Using Sentence Transformers via Hugging Face
                </p>
              </div>

              <div className="space-y-2">
                <Label>Similarity Metric</Label>
                <Select value="cosine" disabled>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cosine">Cosine Similarity</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Using cosine distance for similarity search
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="llm" className="space-y-6 mt-6">
            <Card className="glass p-4 space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groq-llama3.3">Groq - Llama 3.3 (70B versatile)</SelectItem>
                    <SelectItem value="gemini-2.5-flash">Google - Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Google - Gemini 2.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Requires environment variables for the selected provider.
                </p>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Temperature is fixed at 0.3 for consistent, focused responses.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6 mt-6">
            <Card className="glass p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="glass">
            Cancel
          </Button>
          <Button onClick={handleSave} className="glow-border">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}