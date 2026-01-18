import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'INSIRA_AQUI';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'INSIRA_AQUI';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug é obrigatório' });
    }

    // Buscar configuração do cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(
        'id, business_name, seller_whatsapp, what_sell, target_audience, faq, triage_rules, color, logo_url, status'
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Bot não encontrado' });
    }

    // Retornar configuração (SEM a chave de IA)
    return res.status(200).json({
      slug,
      businessName: clientData.business_name,
      sellerWhatsapp: clientData.seller_whatsapp,
      whatSell: clientData.what_sell,
      targetAudience: clientData.target_audience,
      faq: clientData.faq,
      triageRules: clientData.triage_rules,
      color: clientData.color,
      logoUrl: clientData.logo_url
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
