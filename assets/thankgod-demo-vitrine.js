import {listVehicles,subscribe,currency,categoryNames,whatsappUrl} from './thankgod-demo-store.js';
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
const banner=element('aside',null,'demo-banner');
banner.append(element('strong','Vitrine de demonstração'),element('span','Alterações visíveis somente neste navegador.'));
const panel=element('a','Abrir painel');panel.href='thankgod-painel.html';panel.target='_blank';panel.rel='noopener';banner.append(panel);document.body.prepend(banner);
const live=element('span',null,'demo-live');live.setAttribute('role','status');live.setAttribute('aria-live','polite');banner.append(live);
document.querySelector('.stock-note').textContent='Demonstração local. Os anúncios e valores desta página são exemplos de apresentação; confirme dados reais com a loja.';
function cardFor(car,index) {
  const article=element('article',null,'car');article.dataset.category=car.category;
  const photo=element('div',null,'car-photo');
  if(car.photos.length){
    let photoIndex=0;const image=element('img');image.className='vehicle-cover';image.src=car.photos[0].data;image.alt=`${car.make} ${car.model} — foto 1`;photo.append(image);
    if(car.photos.length>1){
      const controls=element('div',null,'gallery-controls');const previous=element('button','Anterior'),next=element('button','Próxima'),count=element('span',`1 / ${car.photos.length}`);
      previous.type=next.type='button';previous.setAttribute('aria-label',`Foto anterior de ${car.make} ${car.model}`);next.setAttribute('aria-label',`Próxima foto de ${car.make} ${car.model}`);
      const change=delta=>{photoIndex=(photoIndex+delta+car.photos.length)%car.photos.length;image.src=car.photos[photoIndex].data;image.alt=`${car.make} ${car.model} — foto ${photoIndex+1}`;count.textContent=`${photoIndex+1} / ${car.photos.length}`;};
      previous.addEventListener('click',()=>change(-1));next.addEventListener('click',()=>change(1));controls.append(previous,count,next);photo.append(controls);
    }
  } else {photo.append(element('span',String(index+1).padStart(2,'0'),'photo-number'),element('div','Fotos em breve','photo-empty'),element('span','THANK GOD / MULTIMARCAS','photo-brand'));}
  photo.append(element('span',car.transmission||categoryNames[car.category]||'Veículo','photo-tag'));
  const body=element('div',null,'car-body');body.append(element('p',car.make.toLocaleUpperCase('pt-BR'),'car-make'),element('h3',car.model));
  const specs=element('div',null,'specs');[car.year,car.transmission,car.color,car.mileage!==null&&car.mileage!==undefined?`${Number(car.mileage).toLocaleString('pt-BR')} km`:null].filter(Boolean).forEach(value=>specs.append(element('span',String(value))));
  const price=element('div',null,'price');price.append(element('span','Valor de demonstração'),element('strong',currency(car.price_cents)));
  const buy=element('a','Comprar pelo WhatsApp','button button-buy');buy.href=whatsappUrl(car);buy.target='_blank';buy.rel='noopener noreferrer';
  body.append(specs,element('p',car.description,'description'),price,buy);article.append(photo,body);return article;
}
let refreshVersion=0;
async function refresh() {
  const version=++refreshVersion;
  try {
    const all=await listVehicles();if(version!==refreshVersion)return;
    const cars=all.filter(car=>car.status==='published');
    const grid=document.querySelector('.cars');grid.replaceChildren(...cars.map(cardFor));
    const filterBar=document.querySelector('.filters'),selected=filterBar.querySelector('.active')?.dataset.filter||'all';
    const categories=[...new Set(cars.map(car=>car.category))];
    filterBar.querySelectorAll('[data-filter]:not([data-filter="all"])').forEach(node=>node.remove());
    categories.forEach(category=>{const button=element('button',categoryNames[category]||'Outro','filter');button.type='button';button.dataset.filter=category;button.setAttribute('aria-pressed','false');filterBar.insertBefore(button,document.querySelector('#result-count'));});
    const activeCategory=categories.includes(selected)?selected:'all';
    filterBar.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===activeCategory;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    if(!cars.length)grid.append(element('p','Nenhum carro publicado na demonstração. Adicione um veículo no painel.','demo-empty'));
    document.dispatchEvent(new Event('thankgod-inventory-updated'));
    live.textContent='Estoque atualizado';
  } catch(error) {live.textContent=error.message;document.querySelector('.cars').replaceChildren(element('p','Não foi possível carregar o estoque de demonstração neste navegador.','demo-empty'));}
}
subscribe(refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
window.addEventListener('pageshow',refresh);
await refresh();
