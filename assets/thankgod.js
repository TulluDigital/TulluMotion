function applyVehicleFilter() {
  const selected = document.querySelector('[data-filter].active')?.dataset.filter || 'all';
  const cars = document.querySelectorAll('.car');
  let count = 0;
  cars.forEach(car => {
    car.hidden = selected !== 'all' && car.dataset.category !== selected;
    if (!car.hidden) count++;
  });
  document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'veículo' : 'veículos'}`;
  const total = document.querySelector('[data-filter="all"] span');
  if (total) total.textContent = cars.length;
}
document.querySelector('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  document.querySelectorAll('[data-filter]').forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  applyVehicleFilter();
});
document.addEventListener('thankgod-inventory-updated', applyVehicleFilter);
document.querySelector('#year').textContent = new Date().getFullYear();
if (new URLSearchParams(location.search).get('demo') === '1') {
  import('./thankgod-demo-vitrine.js').catch(() => {
    const notice = document.createElement('p');
    notice.className = 'demo-banner';
    notice.textContent = 'Não foi possível carregar a demonstração. Reabra esta página no mesmo navegador do painel.';
    document.body.prepend(notice);
  });
}
