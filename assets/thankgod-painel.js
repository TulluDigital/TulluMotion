import {listVehicles,saveVehicle,resetDemo,subscribe,currency,priceToCents,statusNames} from './thankgod-demo-store.js';
const $=selector=>document.querySelector(selector);
const form=$('#vehicle-form'), dialog=$('#editor');
let vehicles=[], editing=null, photos=[], dirty=false, busy=false, loadVersion=0;
function message(text,type='') {const node=$('#notice');node.textContent=text;node.className='notice '+type;node.hidden=!text;}
function element(tag,text,className) {const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;}
function action(label,callback) {const button=element('button',label);button.type='button';button.addEventListener('click',callback);return button;}
function renderList() {
  const term=$('#search').value.trim().toLocaleLowerCase('pt-BR');
  const status=$('#status-filter').value;
  for(const state of ['published','draft','sold']) $('#'+state+'-count').textContent=vehicles.filter(car=>car.status===state).length;
  const filtered=vehicles.filter(car=>(status==='all'||car.status===status)&&`${car.make} ${car.model}`.toLocaleLowerCase('pt-BR').includes(term));
  const list=$('#vehicle-list');list.replaceChildren();
  $('#list-empty').hidden=filtered.length>0;
  $('#list-empty').textContent=vehicles.length ? 'Nenhum veículo corresponde a esta busca.' : 'Nenhum veículo por aqui. Adicione seu primeiro carro.';
  for(const car of filtered) {
    const row=element('article',null,'vehicle-row');
    let thumb;
    if(car.photos[0]) {thumb=element('img');thumb.src=car.photos[0].data;thumb.alt=`${car.make} ${car.model}`;thumb.className='thumb';}
    else thumb=element('div','Sem foto','thumb');
    const info=element('div');info.append(element('h2',`${car.make} ${car.model}`,'row-title'),element('p',`${car.year||'Ano não informado'} · ${currency(car.price_cents)}`,'row-details'),element('span',statusNames[car.status],'badge '+car.status));
    const actions=element('div',null,'row-actions');actions.append(action('Editar',()=>openEditor(car)));
    if(car.status!=='published') actions.append(action('Publicar',()=>changeStatus(car,'published')));
    if(car.status==='published') actions.append(action('Marcar vendido',()=>changeStatus(car,'sold')));
    if(car.status!=='archived') actions.append(action('Retirar',()=>changeStatus(car,'archived')));
    row.append(thumb,info,actions);list.append(row);
  }
}
async function refresh() {
  const version=++loadVersion;
  try {const data=await listVehicles();if(version!==loadVersion)return;vehicles=data;renderList();}
  catch(error){message(error.message,'error');}
}
async function enterDemo() {
  try {vehicles=await listVehicles();$('#access').hidden=true;$('#workspace').hidden=false;$('#logout').hidden=false;renderList();try{sessionStorage.setItem('thankgod-demo-open','1');}catch{}}
  catch(error){message(error.message,'error');}
}
$('#login-form').addEventListener('submit',event=>{event.preventDefault();enterDemo();});
$('#logout').addEventListener('click',()=>{$('#workspace').hidden=true;$('#access').hidden=false;$('#logout').hidden=true;try{sessionStorage.removeItem('thankgod-demo-open');}catch{}});
$('#search').addEventListener('input',renderList);$('#status-filter').addEventListener('change',renderList);
$('#new-car').addEventListener('click',()=>openEditor());
function openEditor(car) {
  form.reset();editing=car ? structuredClone(car) : {id:crypto.randomUUID(),revision:0,status:'draft'};
  photos=car?.photos ? structuredClone(car.photos) : [];dirty=false;$('#form-message').textContent='';
  $('#editor-title').textContent=car ? 'Editar carro' : 'Adicionar carro';
  for(const key of ['make','model','year','mileage','transmission','category','color','description']) if(car) form.elements[key].value=car[key]??'';
  form.elements.price.value=car ? (car.price_cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '';
  form.elements.is_demo.checked=car ? car.is_demo : true;
  renderPhotos();setBusy(false);dialog.showModal();form.elements.make.focus();
}
async function closeEditor(){if(busy)return;if(dirty&&!await askConfirm('Descartar as alterações deste anúncio?'))return;dialog.close();photos=[];editing=null;}
$('#close-editor').addEventListener('click',closeEditor);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
form.addEventListener('input',()=>{dirty=true;});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
function setBusy(value){busy=value;form.querySelectorAll('button,input,textarea,select').forEach(node=>node.disabled=value);$('#publish').textContent=value?'Salvando…':'Publicar na vitrine demo';}
function renderPhotos(){
  const list=$('#photo-list');list.replaceChildren();
  photos.forEach((photo,index)=>{
    const item=element('div',null,'photo-item');const image=element('img');image.src=photo.data;image.alt=`Foto ${index+1} do veículo`;item.append(image);
    if(index===0)item.append(element('span','Capa'));
    else item.append(action('Usar como capa',()=>{photos.unshift(photos.splice(index,1)[0]);dirty=true;renderPhotos();}));
    item.append(action('Remover foto',()=>{photos.splice(index,1);dirty=true;renderPhotos();}));list.append(item);
  });
}
async function preparePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Use fotos JPG, PNG ou WebP.');
  if(file.size>5*1024*1024)throw new Error('Cada foto deve ter até 5 MB.');
  const image=await createImageBitmap(file).catch(()=>{throw new Error('Uma das fotos não pôde ser aberta. Selecione outro arquivo.');});
  const scale=Math.min(1,1800/Math.max(image.width,image.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);image.close();
  return {id:crypto.randomUUID(),data:canvas.toDataURL('image/jpeg',.84)};
}
$('#photos').addEventListener('change',async event=>{
  const files=[...event.target.files];if(!files.length)return;
  if(photos.length+files.length>8){$('#form-message').textContent='Selecione no máximo oito fotos por veículo.';event.target.value='';return;}
  setBusy(true);$('#form-message').textContent='Preparando as fotos…';
  try{const added=[];for(const file of files)added.push(await preparePhoto(file));photos.push(...added);dirty=true;renderPhotos();$('#form-message').textContent='';}
  catch(error){$('#form-message').textContent=error.message;}
  finally{event.target.value='';setBusy(false);}
});
async function save(status) {
  if(busy||!form.reportValidity())return;
  const values=new FormData(form);const price=priceToCents(values.get('price'));
  if(!Number.isSafeInteger(price)||price<=0){$('#form-message').textContent='Informe um preço válido. Exemplo: 69.990,00';form.elements.price.focus();return;}
  const record={...editing,make:values.get('make').trim(),model:values.get('model').trim(),year:values.get('year')?Number(values.get('year')):null,mileage:values.get('mileage')?Number(values.get('mileage')):null,price_cents:price,transmission:values.get('transmission'),category:values.get('category'),color:values.get('color').trim(),description:values.get('description').trim(),is_demo:values.get('is_demo')==='on',status,photos:structuredClone(photos)};
  setBusy(true);$('#form-message').textContent='Salvando neste navegador…';
  try{await saveVehicle(record,editing.revision);dirty=false;dialog.close();editing=null;photos=[];await refresh();message(status==='published'?'Carro publicado na vitrine de demonstração. A outra aba é atualizada automaticamente.':'Rascunho salvo neste navegador. Ele ainda não aparece na vitrine.');}
  catch(error){$('#form-message').textContent=error.message;}
  finally{setBusy(false);}
}
form.addEventListener('submit',event=>{event.preventDefault();save('published');});
$('#save-draft').addEventListener('click',()=>save('draft'));
async function changeStatus(car,status){
  if(!await askConfirm(status==='sold'?'Marcar este carro como vendido e tirar da vitrine demo?':status==='archived'?'Retirar este anúncio da vitrine demo? Você poderá publicá-lo novamente.':'Publicar este carro na vitrine demo?'))return;
  try{await saveVehicle({...car,status},car.revision);await refresh();message('Situação atualizada na demonstração.');}catch(error){message(error.message,'error');await refresh();}
}
$('#reset-demo').addEventListener('click',async()=>{
  if(!await askConfirm('Apagar os carros e as fotos desta demonstração neste navegador e restaurar os quatro exemplos?'))return;
  try{await resetDemo();await refresh();message('Os quatro carros de exemplo foram restaurados.');}catch(error){message(error.message,'error');}
});
subscribe(refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!$('#workspace').hidden)refresh();});
try{if(sessionStorage.getItem('thankgod-demo-open')==='1')enterDemo();}catch{}

function askConfirm(text) {
  return new Promise(resolve => {
    const prompt = element('dialog', null, 'confirm-dialog');
    const title = element('h2', 'Confirmar alteração');
    title.id = 'confirmation-title';
    prompt.setAttribute('aria-labelledby', title.id);
    const buttons = element('div', null, 'confirm-actions');
    const finish = answer => {prompt.close();prompt.remove();resolve(answer);};
    const cancel = action('Cancelar', () => finish(false));cancel.className = 'secondary';
    const accept = action('Confirmar', () => finish(true));accept.className = 'primary';
    buttons.append(cancel, accept);prompt.append(title, element('p', text), buttons);
    prompt.addEventListener('cancel', event => {event.preventDefault();finish(false);});
    document.body.append(prompt);prompt.showModal();cancel.focus();
  });
}
