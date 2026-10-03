// Local presentation adapter. No account, cloud upload, or real authentication.
// The production inventory must use a server-authorized database and object store.
export const DATABASE_NAME = 'thankgod-inventory-demo-v1';
const EVENT_KEY = 'thankgod-demo-changed';
export const seedVehicles = [
  {id:'demo-yaris',make:'Toyota',model:'Yaris',year:2019,price_cents:6999000,transmission:'Automático',category:'hatch',color:'Branco',description:'Praticidade para a rotina e a comodidade do câmbio automático. Conheça os detalhes com nossa equipe.'},
  {id:'demo-hb20',make:'Hyundai',model:'HB20',year:2016,price_cents:4999000,transmission:'',category:'hatch',color:'Branco',description:'Um compacto para acompanhar seus planos na cidade. Consulte a versão, os equipamentos e as condições.'},
  {id:'demo-livina',make:'Nissan',model:'Livina',year:2012,price_cents:3299000,transmission:'',category:'minivan',color:'Prata',description:'Uma opção para quem busca espaço no dia a dia. Fale com a equipe para conhecer esta Livina de perto.'},
  {id:'demo-gol',make:'Volkswagen',model:'Gol',year:null,price_cents:5999000,transmission:'',category:'hatch',color:'Branco',description:'Versatilidade para o trabalho e para os seus passeios. Consulte ano, versão e todos os detalhes pelo WhatsApp.'}
].map((car,i)=>({...car,mileage:null,status:'published',is_demo:true,photos:[],revision:1,created_at:1700000000000-i,updated_at:1700000000000-i}));
let database;
function openDatabase() {
  if (!database) database = new Promise((resolve,reject)=>{
    if (!globalThis.indexedDB) return reject(new Error('Este navegador não permite salvar a demonstração. Use uma janela normal do Chrome, Edge ou Safari.'));
    const request = indexedDB.open(DATABASE_NAME,1);
    request.onupgradeneeded = ()=>{
      const store = request.result.createObjectStore('vehicles',{keyPath:'id'});
      seedVehicles.forEach(car=>store.put(structuredClone(car)));
    };
    request.onsuccess = ()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    request.onerror = ()=>reject(new Error('Não foi possível abrir o armazenamento deste navegador. Verifique se o armazenamento local está permitido.'));
    request.onblocked = ()=>reject(new Error('Feche outras abas antigas desta demonstração e tente novamente.'));
  });
  return database;
}
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(EVENT_KEY) : null;
const listeners = new Set();
const announce = ()=>listeners.forEach(callback=>callback());
if(channel) channel.onmessage = announce;
globalThis.addEventListener('storage',event=>{if(event.key===EVENT_KEY) announce();});
function notify() {
  channel?.postMessage('changed');
  try {localStorage.setItem(EVENT_KEY,`${Date.now()}-${Math.random()}`);} catch {}
  announce();
}
export function subscribe(callback) {listeners.add(callback);return ()=>listeners.delete(callback);}
export async function listVehicles() {
  const db = await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('vehicles','readonly');
    const request=transaction.objectStore('vehicles').getAll();
    transaction.oncomplete=()=>resolve(request.result.sort((a,b)=>b.created_at-a.created_at));
    transaction.onerror=()=>reject(new Error('Não foi possível carregar os anúncios.'));
  });
}
export async function saveVehicle(car,expectedRevision) {
  if (!car.make?.trim() || !car.model?.trim() || !car.description?.trim()) throw new Error('Preencha marca, modelo e descrição.');
  if (!Number.isSafeInteger(car.price_cents) || car.price_cents<=0 || car.price_cents>100000000000) throw new Error('Informe um preço válido, maior que zero.');
  if (!['draft','published','sold','archived'].includes(car.status)) throw new Error('Situação do anúncio inválida.');
  if (!Array.isArray(car.photos) || car.photos.length>8 || car.photos.some(photo=>!/^data:image\/(jpeg|png|webp);base64,/.test(photo.data))) throw new Error('Selecione até oito imagens válidas.');
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    let failure, saved;
    const transaction=db.transaction('vehicles','readwrite');
    const store=transaction.objectStore('vehicles');
    const request=store.get(car.id);
    request.onsuccess=()=>{
      const current=request.result;
      if ((current?.revision || 0)!==expectedRevision) {failure=new Error('Este anúncio mudou em outra aba. Feche a edição e abra novamente para usar os dados atuais.');transaction.abort();return;}
      saved={...car,revision:(current?.revision||0)+1,created_at:current?.created_at||Date.now(),updated_at:Date.now()};
      store.put(saved);
    };
    transaction.oncomplete=()=>{notify();resolve(saved);};
    transaction.onerror=transaction.onabort=()=>reject(failure || new Error('Não foi possível salvar. O armazenamento pode estar cheio. Reduza a quantidade de fotos e tente novamente; os campos foram mantidos.'));
  });
}
export async function resetDemo() {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('vehicles','readwrite');
    const store=transaction.objectStore('vehicles');store.clear();seedVehicles.forEach(car=>store.put(structuredClone(car)));
    transaction.oncomplete=()=>{notify();resolve();};
    transaction.onerror=()=>reject(new Error('Não foi possível restaurar a demonstração.'));
  });
}
export const currency = cents => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:cents%100 ? 2 : 0}).format(cents/100);
export function priceToCents(value) {
  const clean=String(value).trim().replace(/^R\$\s*/,'').replace(/\s/g,'');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(clean)) return NaN;
  return Math.round(Number(clean.replaceAll('.','').replace(',','.'))*100);
}
export const categoryNames={hatch:'Hatch',sedan:'Sedã',suv:'SUV',pickup:'Picape',minivan:'Minivan',other:'Outro'};
export const statusNames={published:'Na vitrine',draft:'Rascunho',sold:'Vendido',archived:'Retirado'};
export function whatsappUrl(car) {
  return 'https://wa.me/5511988217900?text='+encodeURIComponent(`Olá! Vi a demonstração do site e tenho interesse no ${car.make} ${car.model}${car.year?' '+car.year:''}. Poderia confirmar o valor real e a disponibilidade?`);
}
