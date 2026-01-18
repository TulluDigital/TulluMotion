# SaaS Bot de Pré-Atendimento com IA

Um mini-SaaS completo para criar bots de IA para pré-atendimento e qualificação de leads. Os empreendedores usam sua própria chave de IA (OpenAI ou Gemini) e recebem uma página pública para capturar leads.

## 📋 Visão Geral

### Características Principais

- **Wizard 3 Etapas**: Onboarding simples para configurar o bot
- **Página Pública**: URL única por cliente (`/c/<slug>`)
- **Chat com IA**: Triagem automática de leads com 2-4 perguntas
- **Integração WhatsApp**: Botão final com resumo completo para continuar no WhatsApp
- **Segurança**: Chave de IA do cliente criptografada, nunca exposta
- **Rate Limiting**: Proteção básica contra abuso

### Stack Tecnológico

- **Frontend**: HTML/CSS/JS puro (sem frameworks)
- **Backend**: Vercel Functions (Node.js/TypeScript)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (logos)
- **Criptografia**: Node.js crypto (AES-256-CBC)

## 🚀 Quick Start

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/saas-bot-ia.git
cd saas-bot-ia
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados e crie o projeto
4. Aguarde a inicialização

#### 3.2 Aplicar Migrations

1. Vá para "SQL Editor" no dashboard Supabase
2. Clique em "New Query"
3. Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Cole e execute

#### 3.3 Criar Storage Bucket

1. Vá para "Storage" no dashboard Supabase
2. Clique em "New Bucket"
3. Nome: `logos`
4. Marque "Public bucket"
5. Clique em "Create bucket"

#### 3.4 Obter Credenciais

1. Vá para "Settings" → "API"
2. Copie:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configurar Variáveis de Ambiente

Crie arquivo `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
ENCRYPTION_SECRET=sua_chave_secreta_aleatoria_32_chars
```

**Para gerar `ENCRYPTION_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 5. Rodar Localmente

```bash
npm run dev
```

Acesse:
- Wizard: `http://localhost:3000/criar-bot/`
- Página pública (exemplo): `http://localhost:3000/c/seu-slug-aqui`

## 📁 Estrutura de Arquivos

```
saas-bot-ia/
├── public/
│   ├── criar-bot/
│   │   └── index.html          # Wizard 3 etapas
│   ├── c/
│   │   └── index.html          # Página pública do cliente
│   └── assets/
│       ├── css/
│       │   ├── styles.css      # CSS base
│       │   └── branch-pages.css # CSS específico
│       └── js/
│           ├── onboarding.js   # Lógica do wizard
│           └── client-page.js  # Lógica da página pública
├── api/
│   ├── onboard.ts              # POST /api/onboard
│   ├── config.ts               # GET /api/config?slug=...
│   ├── session.ts              # POST /api/session
│   ├── chat.ts                 # POST /api/chat
│   └── health.ts               # GET /api/health
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### 1. POST `/api/onboard`

Criar novo bot e publicar página.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "whatsapp": "(11) 99999-9999",
  "segment": "saude",
  "businessName": "Clínica Saúde",
  "sellerWhatsapp": "(11) 98888-8888",
  "whatSell": "Serviços de saúde",
  "targetAudience": "Pessoas de 18-65 anos",
  "faq": "P: Qual é o horário? R: 8h-18h",
  "triageRules": "Perguntar: 1) Qual é a urgência? 2) Já foi cliente?",
  "color": "#0E6BFF",
  "aiKey": "sk-...",
  "logo": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "slug": "clinica-saude-abc123",
  "page_url": "/c/clinica-saude-abc123"
}
```

### 2. GET `/api/config?slug=...`

Obter configuração pública do bot (sem chave de IA).

**Response:**
```json
{
  "slug": "clinica-saude-abc123",
  "businessName": "Clínica Saúde",
  "sellerWhatsapp": "(11) 98888-8888",
  "whatSell": "Serviços de saúde",
  "targetAudience": "Pessoas de 18-65 anos",
  "faq": "P: Qual é o horário? R: 8h-18h",
  "triageRules": "Perguntar: 1) Qual é a urgência? 2) Já foi cliente?",
  "color": "#0E6BFF",
  "logoUrl": "https://..."
}
```

### 3. POST `/api/session`

Criar nova sessão de chat.

**Request:**
```json
{
  "slug": "clinica-saude-abc123",
  "leadName": "Maria",
  "leadCity": "São Paulo",
  "leadMessage": "Quero agendar uma consulta",
  "leadAge": 35
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid-aqui"
}
```

### 4. POST `/api/chat`

Enviar mensagem e obter resposta da IA.

**Request:**
```json
{
  "slug": "clinica-saude-abc123",
  "sessionId": "uuid-aqui",
  "message": "Preciso de uma consulta urgente"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Entendo sua urgência. Qual é o melhor horário para você?"
}
```

### 5. GET `/api/health`

Health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-17T10:00:00Z",
  "version": "1.0.0"
}
```

## 🔐 Segurança

### Proteções Implementadas

1. **Criptografia de Chave de IA**
   - Chave do cliente é criptografada com AES-256-CBC
   - Nunca é exposta no frontend
   - Apenas descriptografada no backend para chamar IA

2. **Rate Limiting**
   - 10 requisições por minuto por IP
   - Proteção contra abuso

3. **Validação de Entrada**
   - Validação de email, telefone, etc.
   - Sanitização de HTML no chat

4. **Isolamento de Dados**
   - Cada cliente tem seu próprio slug
   - Dados isolados por `client_id`

## 📊 Schema do Banco de Dados

### users
```sql
id (UUID) | name | email | whatsapp | segment | created_at | updated_at
```

### clients
```sql
id | user_id | slug | business_name | seller_whatsapp | what_sell | 
target_audience | faq | triage_rules | color | logo_url | 
ai_key_encrypted | status | created_at | updated_at
```

### pages
```sql
id | client_id | slug | status | created_at | updated_at
```

### leads
```sql
id | client_id | name | city | message | age | created_at | updated_at
```

### sessions
```sql
id | session_id | client_id | lead_id | created_at | updated_at
```

### messages
```sql
id | session_id | role | content | created_at
```

## 🚢 Deploy no Vercel

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Clique em "Import"

### 2. Configurar Variáveis de Ambiente

1. Vá para "Settings" → "Environment Variables"
2. Adicione:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_SECRET`

### 3. Deploy

1. Clique em "Deploy"
2. Aguarde a conclusão
3. Seu site estará em `https://seu-projeto.vercel.app`

## 📝 Checklist de Produção

- [ ] Supabase configurado e migrations aplicadas
- [ ] Storage bucket "logos" criado
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] SSL/HTTPS ativado
- [ ] CORS configurado (se necessário)
- [ ] Rate limiting testado
- [ ] Backup do banco de dados configurado
- [ ] Monitoramento de erros ativado (Sentry, etc.)
- [ ] Testes de carga realizados
- [ ] Documentação atualizada
- [ ] Termos de Serviço e Política de Privacidade revisados
- [ ] LGPD/GDPR compliance verificado

## 🐛 Troubleshooting

### Erro: "Configuração do bot não encontrada"

- Verifique se o slug está correto
- Verifique se o cliente foi criado com sucesso
- Verifique o banco de dados

### Erro: "Erro ao descriptografar chave"

- Verifique se `ENCRYPTION_SECRET` é o mesmo em produção e desenvolvimento
- Regenere a chave se necessário

### Erro: "Muitas requisições"

- Rate limit foi acionado
- Aguarde 1 minuto e tente novamente

### Chat não responde

- Verifique se a chave de IA do cliente é válida
- Verifique se há saldo na conta OpenAI/Gemini
- Verifique os logs no Vercel

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev)

## 📄 Licença

MIT

## 👨‍💻 Autor

Criado por Tullu Motion

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato via [help.manus.im](https://help.manus.im)

---

**Última atualização:** 17 de Janeiro de 2026
