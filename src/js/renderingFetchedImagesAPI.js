import * as basicLightbox from 'basiclightbox';
import imagesTemplate from '../templates/imagesTemplate.hbs';
import { onNotify } from './pNotify.js';

import { ImagesQuery } from './apiService';

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

  if (!imagesQuery.query.trim()) {
    clearGallery();
    onNotify(`Type something to find.`, 'error', 'Error');
    return;
  }

  imagesQuery.resetPage();
  clearGallery();
  fetchAndIncrementPage();
  observer.observe(refs.scrollHelper);
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
  if (imagesQuery.page === 1 && data.hits.length === 0) {
    onNotify('Enter correct request', 'error', `${data.totalHits} was found.`);
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
    observer.disconnect();
    console.log('Error in fetchAndIncrementPage function:', error);
  }
}

function clearGallery() {
  refs.imageList.innerHTML = '';
}


// IntersectionObserver
const options = {
  rootMargin: '150px',
  threshold: 0.2,
};
const onEntry = () => {
  fetchAndIncrementPage();
};
const observer = new IntersectionObserver(onEntry, options);




function onGalleryItemClick(e) {
  const imageInstance = basicLightbox.create(`
 	<img class="large-image" src="${e.currentTarget.dataset.largeImage}" alt=""/>
 `);
  imageInstance.show();
}



