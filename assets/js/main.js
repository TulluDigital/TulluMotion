/* ===== MAIN JAVASCRIPT FILE (atualizado) ===== */

/* ---------- Seletores básicos ---------- */
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

/* ---------- Header on scroll ---------- */
function handleHeaderScroll() {
  if (window.scrollY >= 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}

/* ---------- Mobile menu ---------- */
function toggleMobileMenu() {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}
function closeMobileMenu() {
  navMenu.classList.remove('active');
  navToggle.classList.remove('active');
  document.body.style.overflow = '';
}

/* ---------- Smooth scroll anchors ---------- */
function smoothScrollToAnchor(e) {
  const href = e.currentTarget.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  e.preventDefault();
  const el = document.querySelector(href);
  if (!el) return;
  const offset = header?.offsetHeight ? header.offsetHeight + 12 : 72;
  const top = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - offset);
  window.scrollTo({ top, behavior: 'smooth' });
  closeMobileMenu();
}

/* ---------- Util: throttle/debounce ---------- */
function throttle(fn, limit=16){let t;return (...a)=>{if(!t){fn(...a);t=setTimeout(()=>t=null,limit)}}}
function debounce(fn, wait=250){let to;return(...a)=>{clearTimeout(to);to=setTimeout(()=>fn(...a),wait)}}

/* ---------- Contadores métricas ---------- */
function animateCounter(el, target, duration=2000){
  let cur=0, step=target/(duration/16);
  const id=setInterval(()=>{cur+=step;el.textContent=Math.floor(cur);if(cur>=target){el.textContent=target;clearInterval(id)}},16);
}

/* ---------- Observers (cards/testemunhos/etc) ---------- */
function createIntersectionObserver(){
  const obs=new IntersectionObserver((entries,o)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('animate');
      if(entry.target.classList.contains('metric-card')){
        const n=entry.target.querySelector('.metric-card__number');
        const tgt=parseInt(n?.getAttribute('data-target')||'0',10);
        if(tgt && !n.classList.contains('animated')){ n.classList.add('animated'); animateCounter(n,tgt); }
      }
      o.unobserve(entry.target);
    });
  },{threshold:.1, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.scroll-animate, .metric-card, .service-card, .process-step, .feature').forEach(el=>obs.observe(el));
}

/* ---------- BG anim/parallax ---------- */
function createBackgroundAnimation(){
  const bg=document.querySelector('.hero__bg');
  if(!bg) return;
  let raf, t=0;
  const loop=()=>{ t+=0.01; bg.style.transform=`translate(${Math.sin(t)*10}px, ${Math.cos(t*.8)*15}px)`; raf=requestAnimationFrame(loop); };
  loop();
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) cancelAnimationFrame(raf); else loop(); });
}
function handleParallax(){
  const sc=window.pageYOffset;
  document.querySelectorAll('.hero__bg').forEach(el=>{ el.style.transform=`translateY(${sc*0.5}px)`; });
}

/* ---------- Performance ---------- */
function optimizePerformance(){
  ['assets/img/tullu.png','assets/img/cobra.png.png','assets/img/weblab.png.png','assets/img/growth.png.png','assets/img/aistudio.png.png']
  .forEach(src=>{const l=document.createElement('link');l.rel='preload';l.as='image';l.href=src;document.head.appendChild(l);});
}

/* ---------- Acessibilidade ---------- */
function enhanceAccessibility(){
  if(navToggle){
    navToggle.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleMobileMenu();}
    });
  }
  if(navMenu){
    navMenu.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeMobileMenu(); navToggle?.focus(); }});
  }
  // Skip link
  const skip=document.createElement('a');
  skip.href='#hero'; skip.textContent='Pular para o conteúdo principal';
  skip.className='skip-link';
  skip.style.cssText='position:absolute;top:-40px;left:6px;background:var(--primary);color:#fff;padding:8px;border-radius:4px;z-index:1001;transition:top .3s;';
  skip.addEventListener('focus',()=>skip.style.top='6px');
  skip.addEventListener('blur', ()=>skip.style.top='-40px');
  document.body.insertBefore(skip, document.body.firstChild);
}

/* ---------- Analytics ---------- */
function trackEvent(name, data={}) { if(typeof gtag!=='undefined') gtag('event',name,data); }

/* ---------- CTA tracking ---------- */
function setupCTATracking(){
  document.querySelectorAll('.btn--primary').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const section = btn.closest('section')?.id || 'unknown';
      trackEvent('cta_click',{section,button_text:btn.textContent.trim(),url:btn.href});
    });
  });
}

/* ---------- Scroll progress ---------- */
function createScrollProgress(){
  const bar=document.createElement('div');
  bar.style.cssText='position:fixed;top:0;left:0;width:0%;height:3px;background:var(--gradient-primary);z-index:1002;transition:width .1s ease;';
  document.body.appendChild(bar);
  const update=()=>{ const h=document.documentElement.scrollHeight-window.innerHeight; bar.style.width = (h? (window.pageYOffset/h)*100:0)+'%'; };
  window.addEventListener('scroll', throttle(update, 16));
}

/* ===================================================================== */
/* ====================== DIAGNÓSTICO RÁPIDO ============================ */
/* ===================================================================== */

const DIAG_KEY = 'tullu_diag_state_v1';

function getDiagEls(){
  const root = document.getElementById('diagnostico');
  if(!root) return null;
  return {
    root,
    progress: root.querySelector('.diagnostic__progress-bar'),
    steps:    [...root.querySelectorAll('.diag-step')],
    btnNext:  root.querySelector('[data-diag="next"]'),
    btnPrev:  root.querySelector('[data-diag="prev"]'),
    btnReset: root.querySelector('[data-diag="reset"]'),
    chipsWraps: [...root.querySelectorAll('[data-diag-group]')],
    // Resultado
    resultWrap: root.querySelector('.diag-result'),
    planName:   root.querySelector('.diag-plan__name'),
    planList:   root.querySelector('.diag-plan__bullets'),
    primaryCta: root.querySelector('#diag-primary-cta'),
    secondaryCta: root.querySelector('#diag-secondary-cta')
  };
}

/* ---- Estado e persistência ---- */
function loadState(){ try{ return JSON.parse(sessionStorage.getItem(DIAG_KEY)) || { step:1, answers:{} }; }catch{ return {step:1,answers:{}}; } }
function saveState(state){ try{ sessionStorage.setItem(DIAG_KEY, JSON.stringify(state)); }catch{} }

/* ---- Regras simples de recomendação ---- */
function computeRecommendation(answers){
  // answers: { q1, q2, q3, outro? }
  const a1 = (answers.q1||'').toLowerCase();
  const a2 = (answers.q2||'').toLowerCase();
  const a3 = (answers.q3||'').toLowerCase();

  // Baseado principalmente na prioridade (q1), refinado por q2/q3
  if(a1.includes('site')) {
    return {
      name:'WebLab — site rápido que cresce com você',
      bullets:[
        'Landing page moderna em 5–10 dias',
        'Infra + SEO técnico prontos',
        'Biblioteca de seções evolutivas'
      ],
      u: 'weblab'
    };
  }
  if(a1.includes('leads') || a1.includes('vendas')){
    return {
      name:'Growth — tráfego pago e CRO guiados por dados',
      bullets:[
        'Estrutura de campanhas Meta/Google orientadas a conversão',
        'Testes A/B contínuos no funil',
        'Painel de métricas com foco em ROI'
      ],
      u: 'growth'
    };
  }
  if(a1.includes('automat') || a2.includes('escala') || a3.includes('atendimento')){
    return {
      name:'Cobra — automação de atendimento e operações',
      bullets:[
        'Bots de qualificação e follow-up',
        'Integração com CRM e automações',
        'Redução de ciclo de vendas'
      ],
      u: 'cobra'
    };
  }
  if(a1.includes('estratég') || a1.includes('plano')){
    return {
      name:'AI Studio — soluções sob medida com IA',
      bullets:[
        'Mapeamento de oportunidades de IA por área',
        'Protótipos rápidos e validação com dados',
        'Roadmap tático dos próximos 90 dias'
      ],
      u: 'aistudio'
    };
  }
  // fallback se o usuário digitar algo diferente
  return {
    name:'Diagnóstico com especialista',
    bullets:[
      'Entendimento rápido do contexto',
      'Definição do próximo passo de maior impacto',
      'Roteiro claro e mensurável'
    ],
    u: 'diagnostico'
  };
}

/* ---- Render do resultado + CTAs ---- */
function renderResult(els, rec, answers){
  if(!els.resultWrap) return;
  if(els.planName)  els.planName.textContent = rec.name;
  if(els.planList){
    els.planList.innerHTML = '';
    rec.bullets.forEach(b=>{
      const li=document.createElement('li'); li.textContent=b; els.planList.appendChild(li);
    });
  }
  // CTA primário personalizado para WhatsApp
  const baseMsg =
    `Olá! Vim pelo site da Tullu Motion.%0A`+
    `Quero alavancar meu negócio e recebi a recomendação: ${encodeURIComponent(rec.name)}.%0A`+
    `Resumo das respostas: ${encodeURIComponent(JSON.stringify(answers))}`;
  if(els.primaryCta){
    els.primaryCta.href = `https://wa.me/5511959029428?text=${baseMsg}`;
  }
  if(els.secondaryCta){
    // Aponta para a seção de serviços e fecha menu caso aberto
    els.secondaryCta.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = document.querySelector('#servicos');
      if(!target) return;
      const offset = header?.offsetHeight ? header.offsetHeight+12 : 72;
      const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - offset);
      window.scrollTo({ top, behavior:'smooth' });
    }, { once:true });
  }
  els.resultWrap.removeAttribute('hidden');
}

/* ---- Progresso visual ---- */
function setProgress(els, step, total){
  const pct = Math.max(0, Math.min(100, Math.round(((step-1)/(total-1))*100)));
  if(els.progress) els.progress.style.width = pct + '%';
}

/* ---- Mostrar etapa ---- */
function showStep(els, step){
  els.steps.forEach((s,i)=>{
    if(i===step-1) s.removeAttribute('hidden'); else s.setAttribute('hidden','');
  });
  setProgress(els, step, els.steps.length);
  // Botões
  if(els.btnPrev) els.btnPrev.disabled = step===1;
  if(els.btnNext) els.btnNext.disabled = !canAdvanceFrom(els, step);
}

/* ---- Pode avançar? (precisa de uma resposta na etapa atual) ---- */
function canAdvanceFrom(els, step){
  const cur = els.steps[step-1];
  if(!cur) return false;
  const selected = cur.querySelector('.chip.chip--selected');
  // Se “Outro” estiver selecionado, exige texto
  if(selected?.dataset?.value === 'outro'){
    const txt = cur.querySelector('.diag-text');
    return !!(txt && txt.value.trim().length>0);
  }
  return !!selected;
}

/* ---- Coletar respostas do DOM ---- */
function collectAnswers(els){
  const ans={};
  els.steps.forEach((s,idx)=>{
    const sel = s.querySelector('.chip.chip--selected');
    if(sel){
      const v = sel.dataset.value || sel.textContent.trim();
      if(v==='outro'){
        const t = s.querySelector('.diag-text'); ans['q'+(idx+1)] = (t?.value?.trim()||'Outro');
      }else{
        ans['q'+(idx+1)] = v;
      }
    }
  });
  return ans;
}

/* ---- Eventos de chips (delegation) ---- */
function setupChips(els){
  els.chipsWraps.forEach(group=>{
    group.addEventListener('click', (e)=>{
      const chip = e.target.closest('.chip'); if(!chip) return;
      // alterna seleção exclusiva dentro do grupo
      group.querySelectorAll('.chip').forEach(c=>c.classList.remove('chip--selected'));
      chip.classList.add('chip--selected');

      // campo "Outro"
      const otherInput = group.closest('.diag-step')?.querySelector('.diag-input');
      if(otherInput){
        const textField = otherInput.querySelector('.diag-text');
        if(chip.dataset.value==='outro'){
          otherInput.classList.remove('diag-input--hidden');
          setTimeout(()=>textField?.focus(),10);
        }else{
          otherInput.classList.add('diag-input--hidden');
          if(textField) textField.value='';
        }
      }
      // habilita botão avançar se possível
      const state = loadState();
      const stepIndex = parseInt(group.closest('.diag-step')?.dataset?.step || '1',10);
      if(canAdvanceFrom(els, stepIndex)) els.btnNext.disabled=false;

      // feedback visual leve: rolar chips um pouquinho pra cima (evita “grudar”)
      group.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'nearest' });
    });
  });
}

/* ---- Navegação entre steps ---- */
function setupStepNav(els){
  if(els.btnNext){
    els.btnNext.addEventListener('click', ()=>{
      const state=loadState();
      if(!canAdvanceFrom(els, state.step)) return;

      // salva resposta atual
      state.answers = collectAnswers(els);
      state.step = Math.min(state.step+1, els.steps.length);
      saveState(state);

      showStep(els, state.step);

      // se último step, calcula recomendação
      if(state.step===els.steps.length){
        const rec = computeRecommendation(state.answers);
        renderResult(els, rec, state.answers);
      }

      // rolar a seção pro topo após avançar
      const offset = header?.offsetHeight ? header.offsetHeight + 12 : 72;
      const top = Math.max(0, els.root.getBoundingClientRect().top + window.pageYOffset - offset);
      window.scrollTo({ top, behavior:'smooth' });
    });
  }
  if(els.btnPrev){
    els.btnPrev.addEventListener('click', ()=>{
      const state=loadState();
      state.step = Math.max(1, state.step-1);
      saveState(state);
      showStep(els, state.step);
    });
  }
  if(els.btnReset){
    els.btnReset.addEventListener('click', ()=>{
      const state={ step:1, answers:{} };
      saveState(state);
      // limpa seleções
      els.root.querySelectorAll('.chip').forEach(c=>c.classList.remove('chip--selected'));
      els.root.querySelectorAll('.diag-text').forEach(t=>t.value='');
      els.root.querySelectorAll('.diag-input').forEach(i=>i.classList.add('diag-input--hidden'));
      if(els.resultWrap) els.resultWrap.setAttribute('hidden','');
      showStep(els, 1);
    });
  }
}

/* ---- Restaurar do sessionStorage ---- */
function restoreDiagUI(els){
  const state = loadState();
  // re-marcar seleções
  const qKeys = ['q1','q2','q3'];
  els.steps.forEach((step, idx)=>{
    const val = state.answers[qKeys[idx]];
    if(!val) return;
    let found = null;
    step.querySelectorAll('.chip').forEach(c=>{
      const vv = (c.dataset.value||c.textContent.trim());
      if(!found && (vv===val || (vv==='outro' && val!=='Outro'))){ found = c; }
    });
    if(found){
      // marcar
      step.querySelectorAll('.chip').forEach(c=>c.classList.remove('chip--selected'));
      found.classList.add('chip--selected');
      // se “outro”, reexibe input e repõe texto
      if(found.dataset.value==='outro'){
        const inputWrap = step.querySelector('.diag-input'); inputWrap?.classList.remove('diag-input--hidden');
        const txt = step.querySelector('.diag-text'); if(txt && val && val!=='Outro') txt.value = val;
      }
    }
  });

  // mostra etapa certa
  if(state.step<1 || state.step>els.steps.length) state.step=1;
  showStep(els, state.step);

  // se já estava no final, re-renderiza resultado
  if(state.step===els.steps.length){
    const rec = computeRecommendation(state.answers);
    renderResult(els, rec, state.answers);
  }
}

/* ---- Inicialização do diagnóstico ---- */
function initDiagnostico(){
  const els = getDiagEls();
  if(!els) return; // não existe a seção

  setupChips(els);
  setupStepNav(els);
  restoreDiagUI(els);

  // Habilita/Desabilita “Avançar” dinamicamente quando digitar no “Outro”
  els.root.addEventListener('input', (e)=>{
    if(!(e.target instanceof HTMLElement)) return;
    if(!e.target.classList.contains('diag-text')) return;
    const step = parseInt(e.target.closest('.diag-step')?.dataset?.step || '1',10);
    const state=loadState();
    if(step===state.step && els.btnNext) els.btnNext.disabled = !canAdvanceFrom(els, step);
  });

  // Link do menu “Contato Rápido” deve ir para a seção e abrir step atual
  document.querySelectorAll('a[href="#diagnostico"]').forEach(a=>{
    a.addEventListener('click', smoothScrollToAnchor);
  });
}

/* ===================================================================== */
/* =========================== INIT GERAL =============================== */
/* ===================================================================== */

function init(){
  // performance & segurança
  optimizePerformance();

  // visuais e UX base
  createIntersectionObserver();
  createBackgroundAnimation();
  enhanceAccessibility();
  createScrollProgress();

  // listeners globais
  window.addEventListener('scroll', throttle(()=>{ handleHeaderScroll(); handleParallax(); }, 16));
  window.addEventListener('resize', debounce(()=>{}, 250));

  navToggle?.addEventListener('click', toggleMobileMenu);
  document.querySelectorAll('a[href^="#"]').forEach(l=>l.addEventListener('click', smoothScrollToAnchor));
  document.addEventListener('click', (e)=>{ if(!navMenu?.contains(e.target) && !navToggle?.contains(e.target)) closeMobileMenu(); });

  // marcar elementos para animação on scroll
  document.querySelectorAll('.service-card, .process-step, .feature, .metric-card')
    .forEach(el=>el.classList.add('scroll-animate'));

  // diagnóstico rápido
  initDiagnostico();

  // tracking
  setupCTATracking();

  console.log('Tullu Motion — inicializado.');
}

/* ---- load ---- */
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* ---- export p/ testes ---- */
if(typeof module!=='undefined' && module.exports){
  module.exports = { handleHeaderScroll, toggleMobileMenu, smoothScrollToAnchor, animateCounter, trackEvent, initDiagnostico };
}
