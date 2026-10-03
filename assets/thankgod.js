const filters = document.querySelectorAll('[data-filter]');
const cars = document.querySelectorAll('.car');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  let count = 0;
  cars.forEach(car => {
    car.hidden = button.dataset.filter !== 'all' && car.dataset.category !== button.dataset.filter;
    if (!car.hidden) count++;
  });
  document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'veículo' : 'veículos'}`;
}));
document.querySelector('#year').textContent = new Date().getFullYear();
