import './scripts/customEvent';

import objectFitImages from 'object-fit-images';


window.isMobile = () => window.matchMedia('(max-width: 1000px)').matches;

document.addEventListener('DOMContentLoaded', () => {
  objectFitImages('.js-objectfit');
});
