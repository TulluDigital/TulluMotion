import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || 'INSIRA_AQUI';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'INSIRA_AQUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para descriptografar a chave de IA
function decryptAIKey(encrypted: string): string {
  try {
    const secret = process.env.ENCRYPTION_SECRET || 'INSIRA_AQUI';
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar chave:', error);
    throw new Error('Erro ao descriptografar chave de IA');
  }
}

// Função para chamar IA (OpenAI ou Gemini)
async function callAI(aiKey: string, messages: any[], faq: string, triageRules: string): Promise<string> {
  // Detectar tipo de chave
  const isOpenAI = aiKey.startsWith('sk-');

  if (isOpenAI) {
    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de atendimento ao cliente. Responda com base nas seguintes informações:\n\nFAQ:\n${faq}\n\nRegras de Triagem:\n${triageRules}\n\nSeja conciso, amigável e profissional.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`Erro OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } else {
    // Chamar Google Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um assistente de atendimento ao cliente. Responda com base nas seguintes informações:\n\nFAQ:\n${faq}\n\nRegras de Triagem:\n${triageRules}\n\nPergunta do cliente: ${messages[messages.length - 1].content}`
              }
            ]
          }
        ]
      }),
      headers: {
        'x-goog-api-key': aiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro Gemini: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, sessionId, message } = req.body;

    if (!slug || !sessionId || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Buscar cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, ai_key_encrypted, faq, triage_rules')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Bot não encontrado' });
    }

    // Buscar sessão
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id, lead_id')
      .eq('session_id', sessionId)
      .eq('client_id', clientData.id)
      .single();

    if (sessionError || !sessionData) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Buscar histórico de mensagens
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError);
    }

    // Preparar histórico para IA
    const chatHistory = (messagesData || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Adicionar mensagem do usuário
    chatHistory.push({
      role: 'user',
      content: message
    });

    // Descriptografar chave de IA
    const aiKey = decryptAIKey(clientData.ai_key_encrypted);

    // Chamar IA
    const aiResponse = await callAI(aiKey, chatHistory, clientData.faq, clientData.triage_rules);

    // Salvar mensagens no banco
    await supabase.from('messages').insert([
      {
        session_id: sessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      },
      {
        session_id: sessionId,
        role: 'bot',
        content: aiResponse,
        created_at: new Date().toISOString()
      }
    ]);

    return res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Erro ao processar chat:', error);
    return res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
};
