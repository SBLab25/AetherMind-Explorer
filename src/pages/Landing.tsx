import { motion } from "framer-motion";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { Brain, Zap, Shield, Sparkles, ArrowRight, Database, MessageSquare, FileSearch } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* 3D Background */}
      <LavaLamp />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-strong border-b border-white/10 px-6 py-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold gradient-text">AetherMind</h1>
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-8"
          >
            <div className="inline-block">
              <span className="glass px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <Sparkles className="w-4 h-4 inline mr-2" />
                RAG-Powered Knowledge Explorer
              </span>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold gradient-text leading-tight">
              Unlock the Power of
              <br />
              Your Documents
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload PDFs, TXT, and DOCX files. Ask natural language questions.
              Get AI-synthesized answers powered by advanced Retrieval-Augmented Generation.
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="glow-border group">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/explorer">
                <Button size="lg" variant="outline" className="border-white/20">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="glass-strong p-8 rounded-2xl border border-white/20 hover:glow-border transition-all duration-300">
              <Database className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-3">Smart Ingestion</h3>
              <p className="text-muted-foreground">
                Upload multiple documents with drag-and-drop. Watch as they're embedded,
                chunked, and indexed in real-time.
              </p>
            </div>

            <div className="glass-strong p-8 rounded-2xl border border-white/20 hover:glow-border transition-all duration-300">
              <MessageSquare className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-3">Natural Queries</h3>
              <p className="text-muted-foreground">
                Ask questions in plain English. Our LLM synthesizes answers from your
                documents with streaming responses.
              </p>
            </div>

            <div className="glass-strong p-8 rounded-2xl border border-white/20 hover:glow-border transition-all duration-300">
              <FileSearch className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Transparent RAG</h3>
              <p className="text-muted-foreground">
                See exactly which document chunks were retrieved, with similarity scores
                and full citations.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-12"
          >
            <h3 className="text-4xl font-bold gradient-text">Built for the Future</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-xl border border-white/10">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold">GPT-4 / Llama 3</p>
                <p className="text-sm text-muted-foreground">Advanced LLMs</p>
              </div>

              <div className="glass p-6 rounded-xl border border-white/10">
                <Brain className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-semibold">Vector Embeddings</p>
                <p className="text-sm text-muted-foreground">Semantic Search</p>
              </div>

              <div className="glass p-6 rounded-xl border border-white/10">
                <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="font-semibold">Client-Side First</p>
                <p className="text-sm text-muted-foreground">Privacy Focused</p>
              </div>

              <div className="glass p-6 rounded-xl border border-white/10">
                <Sparkles className="w-8 h-8 text-fuchsia-400 mx-auto mb-3" />
                <p className="font-semibold">21stdev Design</p>
                <p className="text-sm text-muted-foreground">Web3 Ready</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-strong p-12 rounded-3xl border border-white/20 text-center space-y-6"
          >
            <h3 className="text-4xl font-bold gradient-text">Ready to Explore?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start asking questions about your documents today.
              No signup required. No data leaves your browser.
            </p>
            <Link to="/explorer">
              <Button size="lg" className="group">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
            <p>© 2025 AetherMind. Powered by RAG + LLM Synthesis.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
