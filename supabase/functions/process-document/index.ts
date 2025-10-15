import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChunkData {
  text: string;
  index: number;
}

// Function to chunk text into smaller pieces
function chunkText(text: string, chunkSize: number = 500): ChunkData[] {
  const chunks: ChunkData[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push({ text: currentChunk.trim(), index: chunkIndex });
  }
  
  return chunks;
}

// Function to generate embeddings using Hugging Face
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: texts,
        options: { wait_for_model: true }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  return await response.json();
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Extract text from file
    let text = '';
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await file.text();
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF, we'll need to extract text - for now, return error
      throw new Error('PDF processing requires additional setup. Please use .txt files for now.');
    } else {
      throw new Error('Unsupported file type. Please use .txt files.');
    }

    // Create document record
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .insert({
        filename: file.name,
        content_type: file.type,
        file_size: file.size,
        user_id: user.id,
      })
      .select()
      .single();

    if (docError) throw docError;

    console.log(`Document created: ${document.id}`);

    // Chunk the text
    const chunks = chunkText(text);
    console.log(`Generated ${chunks.length} chunks`);

    // Generate embeddings
    const chunkTexts = chunks.map(c => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Insert chunks with embeddings
    const chunksToInsert = chunks.map((chunk, idx) => ({
      document_id: document.id,
      chunk_index: chunk.index,
      content: chunk.text,
      // pgvector column expects a numeric array; insert number[] directly
      embedding: embeddings[idx] as unknown as number[],
    }));

    const { error: chunksError } = await supabaseClient
      .from('document_chunks')
      .insert(chunksToInsert);

    if (chunksError) throw chunksError;

    console.log(`Successfully inserted ${chunks.length} chunks`);

    return new Response(
      JSON.stringify({
        success: true,
        document_id: document.id,
        chunks_count: chunks.length,
        message: 'Document processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing document:', error);
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