import './styles.css';
import './styles/styles.scss';
import '@pnotify/bootstrap4/dist/PNotifyBootstrap4.css';
import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/core/dist/Material.css';
import 'material-design-icons/iconfont/material-icons.css';
import * as basicLightbox from 'basiclightbox';
import imagesTemplate from './templates/imagesTemplate.hbs';
import { onNotify } from './js/pNotify.js';

import { ImagesQuery } from './js/apiService';

const refs = getRefs();
const imagesQuery = new ImagesQuery();

function getRefs() {
  return {
    searchForm: document.querySelector('#search-form'),
    imageList: document.querySelector('.gallery'),
    scrollHelper: document.querySelector('#scroll-helper'),
  };
}

refs.searchForm.query.focus();
refs.searchForm.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  imagesQuery.query = e.currentTarget.elements.query.value;

  if (imagesQuery.query === '') {
    clearGallery();
    onNotify(`Type something to find.`, 'error', 'Error');
    return;
  }

  imagesQuery.resetPage();
  clearGallery();
  fetchAndIncrementPage();
}

function createImagesListMarkup(images, allImagesCount) {
  refs.imageList.insertAdjacentHTML('beforeend', imagesTemplate(images));
  document
    .querySelectorAll('.gallery-item')
    .forEach(item => item.addEventListener('click', onGalleryItemClick));
  if (images.length === 0) {
    onNotify(
      `You have scrolled to the end of ${allImagesCount} items collection.`,
      'notice',
      'Info',
    );
  }
}

function onDataReceived(data) {
  if (data.status === 404) {
    onNotify(`${data.message}`, 'error', data.status);
    return;
  }
  createImagesListMarkup(data.hits, data.totalHits);
}

async function fetchAndIncrementPage() {
  try {
    imagesQuery.fetchImages().then(data => {
      onDataReceived(data);
      imagesQuery.incrementPage();
    });
  } catch (error) {
    console.log('Error in fetchAndIncrementPage function:', error);
  }
}

function clearGallery() {
  refs.imageList.innerHTML = '';
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && imagesQuery.query !== '') {
      fetchAndIncrementPage();
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '100px',
});
observer.observe(refs.scrollHelper);

function onGalleryItemClick(e) {
  const imageInstance = basicLightbox.create(`
 	<img class="large-image" src="${e.currentTarget.dataset.largeImage}" alt=""/>
 `);
  imageInstance.show();
}
