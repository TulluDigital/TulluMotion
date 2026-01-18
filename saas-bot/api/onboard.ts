import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || 'INSIRA_AQUI';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'INSIRA_AQUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para criptografar a chave de IA
function encryptAIKey(key: string): string {
  const secret = process.env.ENCRYPTION_SECRET || 'INSIRA_AQUI';
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Função para gerar slug único
function generateSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);

  const random = Math.random().toString(36).substr(2, 9);
  return `${base}-${random}`;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      // Step 1
      name,
      email,
      whatsapp,
      segment,
      // Step 2
      businessName,
      sellerWhatsapp,
      whatSell,
      targetAudience,
      faq,
      triageRules,
      // Step 3
      color,
      aiKey,
      logo // Base64 ou file
    } = req.body;

    // Validações básicas
    if (!name || !email || !whatsapp || !businessName || !sellerWhatsapp || !aiKey) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // 1. Criar usuário (empreendedor)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        whatsapp,
        segment,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (userError) {
      console.error('Erro ao criar usuário:', userError);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    // 2. Gerar slug único
    const slug = generateSlug(businessName);

    // 3. Fazer upload do logo (se fornecido)
    let logoUrl = null;
    if (logo) {
      try {
        const fileName = `${slug}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, Buffer.from(logo, 'base64'), {
            contentType: 'image/png'
          });

        if (uploadError) {
          console.error('Erro ao fazer upload do logo:', uploadError);
        } else {
          logoUrl = `${supabaseUrl}/storage/v1/object/public/logos/${fileName}`;
        }
      } catch (uploadErr) {
        console.error('Erro no upload:', uploadErr);
      }
    }

    // 4. Criptografar chave de IA
    const encryptedAiKey = encryptAIKey(aiKey);

    // 5. Criar cliente/tenant
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userData.id,
        slug,
        business_name: businessName,
        seller_whatsapp: sellerWhatsapp,
        what_sell: whatSell,
        target_audience: targetAudience,
        faq,
        triage_rules: triageRules,
        color,
        logo_url: logoUrl,
        ai_key_encrypted: encryptedAiKey,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (clientError) {
      console.error('Erro ao criar cliente:', clientError);
      return res.status(500).json({ error: 'Erro ao criar configuração' });
    }

    // 6. Criar página pública
    const { error: pageError } = await supabase
      .from('pages')
      .insert({
        client_id: clientData.id,
        slug,
        status: 'published',
        created_at: new Date().toISOString()
      });

    if (pageError) {
      console.error('Erro ao criar página:', pageError);
      return res.status(500).json({ error: 'Erro ao publicar página' });
    }

    // 7. Retornar sucesso
    return res.status(201).json({
      success: true,
      slug,
      page_url: `/c/${slug}`,
      message: 'Bot criado com sucesso!'
    });
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
