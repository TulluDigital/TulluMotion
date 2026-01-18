import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL || 'INSIRA_AQUI';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'INSIRA_AQUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limiting simples (por IP)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = 10; // 10 requisições
  const window = 60 * 1000; // por minuto

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip)!;
  const recent = timestamps.filter(t => now - t < window);

  if (recent.length >= limit) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] as string || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns minutos.' });
    }

    const { slug, leadName, leadCity, leadMessage, leadAge } = req.body;

    if (!slug || !leadName || !leadCity || !leadMessage) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Buscar cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Bot não encontrado' });
    }

    // Criar lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        client_id: clientData.id,
        name: leadName,
        city: leadCity,
        message: leadMessage,
        age: leadAge || null,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (leadError) {
      console.error('Erro ao criar lead:', leadError);
      return res.status(500).json({ error: 'Erro ao criar sessão' });
    }

    // Criar sessão
    const sessionId = uuidv4();
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        session_id: sessionId,
        client_id: clientData.id,
        lead_id: leadData.id,
        created_at: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError);
      return res.status(500).json({ error: 'Erro ao criar sessão' });
    }

    return res.status(201).json({
      success: true,
      sessionId
    });
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
