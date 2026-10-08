const views = [...document.querySelectorAll('[data-view-panel]')];
const tabs = [...document.querySelectorAll('[data-view-target]')];
const currentYear = document.querySelector('#current-year');
const albumModal = document.querySelector('.album-modal');
const albumTitle = document.querySelector('#album-title');
const albumGallery = document.querySelector('#album-gallery');
const albumTabs = [...document.querySelectorAll('[data-album-tab]')];
const imageViewer = document.querySelector('.image-viewer');
const viewerImage = document.querySelector('.viewer-image');
const viewerCaption = document.querySelector('.viewer-caption');
const formStatus = document.querySelector('.form-status');

const albums = {
	'777': { name: 'DURETTI 777', model: [1, 2, 3, 4], plans: [5, 6, 7, 8] },
	'limo-47': { name: 'DURETTI LIMO 47', model: [9, 10, 11, 12, 13], plans: [14, 15] },
	'limo-54': { name: 'DURETTI LIMO 54', model: [16, 17, 18, 19, 20], plans: [21, 22, 23] },
	'limo-59': { name: 'DURETTI LIMO 59', model: [24, 25, 26, 27], plans: [28, 29, 30] }
};

let activeAlbum = null;
let activeAlbumTab = 'model';
let viewerItems = [];
let viewerIndex = 0;

currentYear.textContent = new Date().getFullYear();

document.querySelectorAll('[data-fallback-src]').forEach((image) => {
	image.addEventListener('error', () => {
		if (image.dataset.fallbackApplied) return;
		image.dataset.fallbackApplied = 'true';
		image.src = image.dataset.fallbackSrc;
	});
});

function activateView(name, focusTab = false) {
	views.forEach((view) => {
		const isActive = view.dataset.viewPanel === name;
		view.classList.toggle('is-active', isActive);
		view.setAttribute('aria-hidden', String(!isActive));
	});
	tabs.filter((tab) => tab.matches('.nav-tab')).forEach((tab) => {
		const isActive = tab.dataset.viewTarget === name;
		tab.classList.toggle('is-active', isActive);
		tab.setAttribute('aria-selected', String(isActive));
		if (isActive && focusTab) tab.focus();
	});
}

tabs.forEach((tab) => tab.addEventListener('click', () => activateView(tab.dataset.viewTarget)));
document.querySelectorAll('[data-view-link]').forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		activateView(link.dataset.viewLink);
	});
});

document.querySelector('.site-nav').addEventListener('keydown', (event) => {
	const currentIndex = tabs.filter((tab) => tab.matches('.nav-tab')).indexOf(event.target);
	if (currentIndex < 0 || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
	event.preventDefault();
	const navTabs = tabs.filter((tab) => tab.matches('.nav-tab'));
	const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? navTabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + navTabs.length) % navTabs.length;
	activateView(navTabs[nextIndex].dataset.viewTarget, true);
});

const slideshowLayers = [...document.querySelectorAll('.hero-slide')];
const slideshowCount = document.querySelector('.hero-slide-count');
const slideshowSources = ['feature.png', 'feature1.png', 'feature2.png', 'feature3.png', 'feature4.png', 'feature5.png'];
const availableSlides = ['feature.png'];
let currentSlide = 0;
let activeSlideLayer = 0;
let slideshowTimer;

function startSlideshowDiscovery(index = 1) {
	if (index >= slideshowSources.length) {
		if (availableSlides.length > 1) slideshowTimer = window.setInterval(showNextSlide, 6500);
		return;
	}
	const probe = new Image();
	probe.onload = () => {
		availableSlides.push(slideshowSources[index]);
		startSlideshowDiscovery(index + 1);
	};
	probe.onerror = () => startSlideshowDiscovery(index + 1);
	probe.src = slideshowSources[index];
}

function showNextSlide() {
	currentSlide = (currentSlide + 1) % availableSlides.length;
	activeSlideLayer = 1 - activeSlideLayer;
	const nextLayer = slideshowLayers[activeSlideLayer];
	nextLayer.src = availableSlides[currentSlide];
	slideshowLayers.forEach((layer, index) => layer.classList.toggle('is-active', index === activeSlideLayer));
	slideshowCount.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(availableSlides.length).padStart(2, '0')}`;
}

startSlideshowDiscovery();

function imagePath(number) {
	return `featured works/${number}.png`;
}

function renderAlbum(tab) {
	activeAlbumTab = tab;
	const numbers = albums[activeAlbum][tab];
	albumTabs.forEach((button) => {
		const isActive = button.dataset.albumTab === tab;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-selected', String(isActive));
		button.querySelector('span').textContent = String(albums[activeAlbum][button.dataset.albumTab].length).padStart(2, '0');
	});
	const activeTab = document.querySelector(`[data-album-tab="${tab}"]`);
	albumGallery.setAttribute('aria-labelledby', activeTab.id);
	albumGallery.replaceChildren(...numbers.map((number, index) => {
		const button = document.createElement('button');
		button.className = 'album-photo';
		button.type = 'button';
		button.dataset.imageIndex = String(index);
		button.setAttribute('aria-label', `View ${albums[activeAlbum].name} ${tab === 'model' ? 'model image' : 'tech spec'} ${index + 1}`);
		const image = document.createElement('img');
		image.src = imagePath(number);
		image.alt = `${albums[activeAlbum].name} ${tab === 'model' ? 'model' : 'tech spec'} ${index + 1}`;
		image.loading = 'lazy';
		const label = document.createElement('span');
		label.textContent = `${String(index + 1).padStart(2, '0')} / ${String(numbers.length).padStart(2, '0')}`;
		button.append(image, label);
		return button;
	}));
}

document.querySelectorAll('.project-card').forEach((card) => {
	card.addEventListener('click', () => {
		activeAlbum = card.dataset.album;
		albumTitle.textContent = albums[activeAlbum].name;
		renderAlbum('model');
		albumModal.showModal();
	});
});

albumTabs.forEach((button) => button.addEventListener('click', () => renderAlbum(button.dataset.albumTab)));
document.querySelector('.album-close').addEventListener('click', () => albumModal.close());
albumModal.addEventListener('click', (event) => {
	if (event.target === albumModal) albumModal.close();
});

function showViewerImage() {
	const item = viewerItems[viewerIndex];
	viewerImage.src = item.src;
	viewerImage.alt = item.alt;
	viewerCaption.textContent = `${item.caption} · ${viewerIndex + 1} / ${viewerItems.length}`;
}

function openViewer(items, index) {
	viewerItems = items;
	viewerIndex = index;
	showViewerImage();
	imageViewer.showModal();
}

function moveViewer(step) {
	viewerIndex = (viewerIndex + step + viewerItems.length) % viewerItems.length;
	showViewerImage();
}

albumGallery.addEventListener('click', (event) => {
	const photo = event.target.closest('.album-photo');
	if (!photo) return;
	const numbers = albums[activeAlbum][activeAlbumTab];
	const items = numbers.map((number, index) => ({
		src: imagePath(number),
		alt: `${albums[activeAlbum].name} ${activeAlbumTab === 'model' ? 'model image' : 'tech spec'} ${index + 1}`,
		caption: `${albums[activeAlbum].name} · ${activeAlbumTab === 'model' ? 'Model' : 'Tech Specs'}`
	}));
	openViewer(items, Number(photo.dataset.imageIndex));
});

function createAssetCards(container, firstNumber, label) {
	const cards = Array.from({ length: 6 }, (_, index) => {
		const number = firstNumber + index;
		const card = document.createElement('article');
		card.className = 'asset-card glass-card is-missing';
		const image = document.createElement('img');
		image.src = `${number}.png`;
		image.alt = `${label} ${index + 1}`;
		image.loading = 'lazy';
		image.addEventListener('load', () => {
			card.classList.remove('is-missing');
			card.classList.add('has-image');
		});
		image.addEventListener('error', () => card.classList.add('is-missing'));
		const numberLabel = document.createElement('span');
		numberLabel.className = 'asset-number';
		numberLabel.textContent = `${label.toUpperCase()} / ${String(index + 1).padStart(2, '0')}`;
		const placeholder = document.createElement('div');
		placeholder.className = 'asset-placeholder';
		placeholder.append(document.createTextNode('Image coming soon'));
		const source = document.createElement('span');
		source.textContent = `${number}.png`;
		placeholder.append(source);
		card.append(image, numberLabel, placeholder);
		card.addEventListener('click', () => {
			if (!image.naturalWidth) return;
			const sources = cards.filter((item) => item.querySelector('img').naturalWidth).map((item) => ({
				src: item.querySelector('img').src,
				alt: item.querySelector('img').alt,
				caption: label
			}));
			const selectedIndex = sources.findIndex((item) => item.src === image.src);
			openViewer(sources, selectedIndex);
		});
		return card;
	});
	container.replaceChildren(...cards);
}

document.querySelectorAll('[data-asset-gallery]').forEach((gallery) => {
	const firstNumber = Number(gallery.dataset.assetGallery);
	createAssetCards(gallery, firstNumber, firstNumber === 101 ? 'Day cruise' : 'Working boat');
});

document.querySelector('.viewer-close').addEventListener('click', () => imageViewer.close());
document.querySelector('.viewer-prev').addEventListener('click', () => moveViewer(-1));
document.querySelector('.viewer-next').addEventListener('click', () => moveViewer(1));
imageViewer.addEventListener('click', (event) => {
	if (event.target === imageViewer) imageViewer.close();
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		if (imageViewer.open) imageViewer.close();
		else if (albumModal.open) albumModal.close();
	}
	if (!imageViewer.open) return;
	if (event.key === 'ArrowLeft') moveViewer(-1);
	if (event.key === 'ArrowRight') moveViewer(1);
});

document.querySelector('.inquiry-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const fields = new FormData(event.currentTarget);
	const body = [
		`Name: ${fields.get('name')}`,
		`Email: ${fields.get('email')}`,
		`Phone: ${fields.get('phone')}`,
		`Interest: ${fields.get('interest')}`,
		'',
		String(fields.get('message'))
	].join('\n');
	formStatus.textContent = 'Opening your email app with the inquiry details.';
	window.location.href = `mailto:?subject=${encodeURIComponent('Duretti Yachts inquiry')}&body=${encodeURIComponent(body)}`;
});
