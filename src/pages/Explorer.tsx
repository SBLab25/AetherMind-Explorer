import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DocumentIngestion } from "@/components/DocumentIngestion";
import { QueryInterface } from "@/components/QueryInterface";
import { ChatHistory } from "@/components/ChatHistory";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ model: 'gemini-2.5-flash', top_k: 5 });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/auth');
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* 3D Background */}
      <LavaLamp />

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-strong border-b border-white/10 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">AetherMind Explorer</h1>
              <p className="text-sm text-muted-foreground">RAG-Powered Knowledge Base</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Document Ingestion */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-80 glass-strong border-r border-white/10 flex-shrink-0"
          >
            <DocumentIngestion />
          </motion.aside>

          {/* Center - Query Interface */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <QueryInterface settings={settings} />
          </motion.main>

          {/* Right Sidebar - Chat History */}
          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-80 glass-strong border-l border-white/10 flex-shrink-0"
          >
            <ChatHistory onSettingsClick={() => setSettingsOpen(true)} />
          </motion.aside>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} onSettingsChange={setSettings} />
    </div>
  );
};

export default Index;