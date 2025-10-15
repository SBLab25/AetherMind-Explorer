import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model configurations
const MODEL_CONFIG = {
  // OpenRouter models
  'deepseek-r1': {
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1-0528-qwen3-8b',
    apiKey: 'OPENROUTER_API_KEY',
  },
  'deepseek-v3': {
    provider: 'openrouter',
    model: 'deepseek/deepseek-v3.1',
    apiKey: 'OPENROUTER_API_KEY',
  },
  'glm-4.5': {
    provider: 'openrouter',
    model: 'zai/glm-4.5-air',
    apiKey: 'OPENROUTER_API_KEY',
  },
  // Grok models
  'grok-beta': {
    provider: 'xai',
    model: 'grok-beta',
    apiKey: 'XAI_API_KEY',
  },
  'grok-2': {
    provider: 'xai',
    model: 'grok-2-latest',
    apiKey: 'XAI_API_KEY',
  },
  // Google Gemini
  'gemini-2.5-flash': {
    provider: 'google',
    model: 'gemini-2.5-flash',
    apiKey: 'GOOGLE_AI_API_KEY',
  },
  'gemini-2.5-pro': {
    provider: 'google',
    model: 'gemini-2.5-pro',
    apiKey: 'GOOGLE_AI_API_KEY',
  },
};

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  return await response.json();
}

async function callOpenRouter(prompt: string, model: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://aethermind.app',
      'X-Title': 'AetherMind RAG',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callXAI(prompt: string, model: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`X.AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGoogle(prompt: string, model: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callLLM(prompt: string, modelKey: string): Promise<string> {
  const config = MODEL_CONFIG[modelKey as keyof typeof MODEL_CONFIG] || MODEL_CONFIG['gemini-2.5-flash'];
  const apiKey = Deno.env.get(config.apiKey);

  if (!apiKey) {
    throw new Error(`API key ${config.apiKey} not configured`);
  }

  switch (config.provider) {
    case 'openrouter':
      return await callOpenRouter(prompt, config.model, apiKey);
    case 'xai':
      return await callXAI(prompt, config.model, apiKey);
    case 'google':
      return await callGoogle(prompt, config.model, apiKey);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { query, model = 'gemini-2.5-flash', top_k = 5 } = await req.json();

    if (!query) {
      throw new Error('Query text is required');
    }

    console.log(`Processing query: "${query}" with model: ${model}`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar chunks using pgvector
    const { data: similarChunks, error: searchError } = await supabaseClient.rpc(
      'match_document_chunks',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: top_k,
        user_id: user.id,
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    console.log(`Found ${similarChunks?.length || 0} relevant chunks`);

    // Build context from retrieved chunks
    let context = '';
    const sources = new Set<string>();

    if (similarChunks && similarChunks.length > 0) {
      context = similarChunks
        .map((chunk: any) => {
          sources.add(chunk.filename);
          return chunk.content;
        })
        .join('\n\n---\n\n');
    }

    // Build the prompt
    const prompt = `You are a helpful assistant. Answer the user's question using ONLY the context provided below.
Cite sources by filename in parentheses when relevant. If the answer is not in the context, say you don't know.

Context:
${context || 'No relevant context found.'}

Question: ${query}

Answer:`;

    // Call the LLM
    const answer = await callLLM(prompt, model);

    return new Response(
      JSON.stringify({
        answer,
        model_used: model,
        sources: Array.from(sources),
        chunks_found: similarChunks?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});