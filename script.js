const views = [...document.querySelectorAll('[data-view-panel]')];
const tabs = [...document.querySelectorAll('[data-view-target]')];
const currentYear = document.querySelector('#current-year');
const albumModal = document.querySelector('.album-modal');
const albumTitle = document.querySelector('#album-title');
const albumGallery = document.querySelector('#album-gallery');
const specGallery = document.querySelector('#spec-gallery');
const modelFeature = document.querySelector('.model-feature');
const modelCaption = document.querySelector('.model-caption-text');
const modelCounter = document.querySelector('.model-counter');
const modelThumbnails = document.querySelector('.model-thumbnails');
const albumTabs = [...document.querySelectorAll('[data-album-tab]')];
const imageViewer = document.querySelector('.image-viewer');
const viewerImage = document.querySelector('.viewer-image');
const viewerCaption = document.querySelector('.viewer-caption');
const viewerZoomIn = document.querySelector('.viewer-zoom-in');
const viewerZoomOut = document.querySelector('.viewer-zoom-out');
const viewerZoomReset = document.querySelector('.viewer-zoom-reset');
const formStatus = document.querySelector('.form-status');

const albums = {
	'777': { name: 'DURETTI 777', folder: '777', model: [1, 2, 3, 4], plans: [5, 6, 7, 8] },
	'limo-47': { name: 'DURETTI LIMO 47', folder: 'LIMO 47', model: [9, 10, 11, 12, 13], plans: [14, 15] },
	'limo-54': { name: 'DURETTI LIMO 54', folder: 'LIMO 54', model: [16, 17, 18, 19, 20], plans: [21, 22, 23] },
	'limo-59': { name: 'DURETTI LIMO 59', folder: 'LIMO 59', model: [24, 25, 26, 27], plans: [28, 29, 30] }
};

let activeAlbum = null;
let activeAlbumTab = 'model';
let activeModelImage = 0;
let albumOpener = null;
let viewerOpener = null;
let viewerItems = [];
let viewerIndex = 0;
let viewerZoom = 1;

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
const slideshowImages = [
	'public/assets/images/hero-yacht-sunset.webp',
	'public/assets/images/yachts-fleet.webp',
	'public/assets/images/about-yacht-lifestyle.webp',
	'public/assets/images/yacht-aerial.webp',
	'public/assets/images/yacht-interior.webp'
];
let slideshowSources = [];
let availableSlides = [];
let currentSlide = 0;
let activeSlideLayer = 0;
let slideshowTimer;
let slideshowDiscoveryToken = 0;

function startSlideshowDiscovery(index = 1, token = slideshowDiscoveryToken) {
	if (token !== slideshowDiscoveryToken) return;
	if (index >= slideshowSources.length) {
		if (availableSlides.length > 1) slideshowTimer = window.setInterval(showNextSlide, 6500);
		return;
	}
	const probe = new Image();
	probe.onload = () => {
		if (token !== slideshowDiscoveryToken) return;
		availableSlides.push(slideshowSources[index]);
		startSlideshowDiscovery(index + 1, token);
	};
	probe.onerror = () => startSlideshowDiscovery(index + 1, token);
	probe.src = slideshowSources[index];
}

function initializeSlideshow() {
	window.clearInterval(slideshowTimer);
	slideshowDiscoveryToken += 1;
	slideshowSources = slideshowImages;
	availableSlides = [slideshowSources[0]];
	currentSlide = 0;
	activeSlideLayer = 0;
	slideshowLayers[0].src = slideshowSources[0];
	slideshowLayers[0].classList.add('is-active');
	slideshowLayers[1].removeAttribute('src');
	slideshowLayers[1].classList.remove('is-active');
	startSlideshowDiscovery(1, slideshowDiscoveryToken);
}

function showNextSlide() {
	currentSlide = (currentSlide + 1) % availableSlides.length;
	activeSlideLayer = 1 - activeSlideLayer;
	const nextLayer = slideshowLayers[activeSlideLayer];
	nextLayer.src = availableSlides[currentSlide];
	slideshowLayers.forEach((layer, index) => layer.classList.toggle('is-active', index === activeSlideLayer));
}

initializeSlideshow();

function imagePath(number) {
	return `featured works/${number}.png`;
}

function albumImagePath(category, number) {
	return `featured works/${albums[activeAlbum].folder}/${category}/${number}.png`;
}

function getAlbumImages(category) {
	return albums[activeAlbum][category].map((number, index) => ({
		src: albumImagePath(category === 'model' ? 'model' : 'specs', number),
		alt: `${albums[activeAlbum].name} ${category === 'model' ? 'model view' : 'technical drawing'} ${index + 1}`,
		caption: `${albums[activeAlbum].name} · ${category === 'model' ? 'Model' : 'Technical drawing'} ${index + 1}`
	}));
}

function renderAlbum(tab) {
	activeAlbumTab = tab;
	const isModel = tab === 'model';
	albumTabs.forEach((button) => {
		const isActive = button.dataset.albumTab === tab;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-selected', String(isActive));
		button.tabIndex = isActive ? 0 : -1;
	});
	albumGallery.hidden = !isModel;
	specGallery.hidden = isModel;
	if (isModel) {
		const items = getAlbumImages('model');
		activeModelImage = 0;
		modelThumbnails.replaceChildren(...items.map((item, index) => {
			const button = document.createElement('button');
			button.className = 'model-thumbnail';
			button.type = 'button';
			button.dataset.imageIndex = String(index);
			button.setAttribute('aria-label', `Show ${item.caption}`);
			button.setAttribute('aria-pressed', String(index === activeModelImage));
			const image = document.createElement('img');
			image.src = item.src;
			image.alt = '';
			image.loading = 'eager';
			button.append(image);
			return button;
		}));
		showModelImage();
		return;
	}

	const items = getAlbumImages('plans');
	specGallery.replaceChildren(...items.map((item, index) => {
		const button = document.createElement('button');
		button.className = 'spec-card';
		button.type = 'button';
		button.dataset.imageIndex = String(index);
		button.setAttribute('aria-label', `Enlarge ${item.caption}`);
		const image = document.createElement('img');
		image.src = item.src;
		image.alt = item.alt;
		image.loading = 'eager';
		const caption = document.createElement('span');
		caption.textContent = item.caption;
		button.append(image, caption);
		return button;
	}));
}

function showModelImage() {
	const items = getAlbumImages('model');
	const item = items[activeModelImage];
	modelFeature.src = item.src;
	modelFeature.alt = item.alt;
	modelCaption.textContent = item.caption;
	modelCounter.textContent = `${String(activeModelImage + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
	modelThumbnails.querySelectorAll('.model-thumbnail').forEach((button, index) => {
		const isActive = index === activeModelImage;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-pressed', String(isActive));
	});
}

function moveModelImage(step) {
	const count = albums[activeAlbum].model.length;
	activeModelImage = (activeModelImage + step + count) % count;
	showModelImage();
	const activeThumbnail = modelThumbnails.querySelector('.model-thumbnail.is-active');
	if (activeThumbnail) {
		if (activeThumbnail.offsetLeft < modelThumbnails.scrollLeft) modelThumbnails.scrollTo({ left: activeThumbnail.offsetLeft, behavior: 'smooth' });
		else if (activeThumbnail.offsetLeft + activeThumbnail.offsetWidth > modelThumbnails.scrollLeft + modelThumbnails.clientWidth) {
			modelThumbnails.scrollTo({ left: activeThumbnail.offsetLeft + activeThumbnail.offsetWidth - modelThumbnails.clientWidth, behavior: 'smooth' });
		}
	}
}

function closeAlbum() {
	if (!albumModal.open) return;
	albumModal.close();
	window.setTimeout(() => albumOpener?.focus(), 0);
}

function closeViewer() {
	if (!imageViewer.open) return;
	imageViewer.close();
	window.setTimeout(() => viewerOpener?.focus(), 0);
}

document.querySelectorAll('.project-card').forEach((card) => {
	card.addEventListener('click', () => {
		activeAlbum = card.dataset.album;
		albumOpener = card;
		albumTitle.textContent = albums[activeAlbum].name;
		renderAlbum('model');
		albumModal.showModal();
		document.querySelector('.album-close').focus();
	});
});

albumTabs.forEach((button) => {
	button.addEventListener('click', () => renderAlbum(button.dataset.albumTab));
	button.addEventListener('keydown', (event) => {
		if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const index = event.key === 'Home' ? 0 : event.key === 'End' ? albumTabs.length - 1 : (albumTabs.indexOf(button) + (event.key === 'ArrowRight' ? 1 : -1) + albumTabs.length) % albumTabs.length;
		albumTabs[index].focus();
		renderAlbum(albumTabs[index].dataset.albumTab);
	});
});
document.querySelector('.album-close').addEventListener('click', closeAlbum);
albumModal.addEventListener('click', (event) => {
	if (event.target === albumModal) closeAlbum();
});

document.querySelector('.model-prev').addEventListener('click', () => moveModelImage(-1));
document.querySelector('.model-next').addEventListener('click', () => moveModelImage(1));

function showViewerImage() {
	const item = viewerItems[viewerIndex];
	viewerImage.src = item.src;
	viewerImage.alt = item.alt;
	viewerCaption.textContent = `${item.caption} · ${String(viewerIndex + 1).padStart(2, '0')} / ${String(viewerItems.length).padStart(2, '0')}`;
	viewerZoom = 1;
	viewerImage.style.transform = `scale(${viewerZoom})`;
	viewerZoomIn.disabled = false;
	viewerZoomOut.disabled = true;
	viewerZoomReset.disabled = true;
}

function openViewer(items, index, opener = document.activeElement) {
	viewerItems = items;
	viewerIndex = index;
	viewerOpener = opener;
	showViewerImage();
	imageViewer.showModal();
	document.querySelector('.viewer-close').focus();
}

function moveViewer(step) {
	viewerIndex = (viewerIndex + step + viewerItems.length) % viewerItems.length;
	showViewerImage();
}

function zoomViewer(step) {
	viewerZoom = Math.min(3, Math.max(1, viewerZoom + step));
	viewerImage.style.transform = `scale(${viewerZoom})`;
	viewerZoomIn.disabled = viewerZoom === 3;
	viewerZoomOut.disabled = viewerZoom === 1;
	viewerZoomReset.disabled = viewerZoom === 1;
}

albumGallery.addEventListener('click', (event) => {
	const thumbnail = event.target.closest('.model-thumbnail');
	if (thumbnail) {
		activeModelImage = Number(thumbnail.dataset.imageIndex);
		showModelImage();
		return;
	}
	if (event.target.closest('.model-feature-button')) openViewer(getAlbumImages('model'), activeModelImage);
});

specGallery.addEventListener('click', (event) => {
	const card = event.target.closest('.spec-card');
	if (card) openViewer(getAlbumImages('plans'), Number(card.dataset.imageIndex), card);
});

document.querySelector('.viewer-close').addEventListener('click', closeViewer);
document.querySelector('.viewer-prev').addEventListener('click', () => moveViewer(-1));
document.querySelector('.viewer-next').addEventListener('click', () => moveViewer(1));
viewerZoomIn.addEventListener('click', () => zoomViewer(.5));
viewerZoomOut.addEventListener('click', () => zoomViewer(-.5));
viewerZoomReset.addEventListener('click', () => {
	viewerZoom = 1;
	showViewerImage();
});
imageViewer.addEventListener('click', (event) => {
	if (event.target === imageViewer) closeViewer();
});

const assetGalleries = {
	cruises: {
		label: 'Day cruise',
		items: [
			{ src: 'public/assets/images/day-cruises.webp', alt: 'Yacht cruising along the coast' },
			{ src: 'public/assets/images/day-cruise-deck.webp', alt: 'Relaxing on a yacht during a day cruise' },
			{ src: 'public/assets/images/yacht-aerial.webp', alt: 'Aerial view of a yacht on open water' }
		]
	},
	working: {
		label: 'Working boats',
		items: [
			{ src: 'public/assets/images/working-boats.webp', alt: 'Duretti working boat on the water' }
		]
	}
};

function createAssetCards(container, { label, items }) {
	const cards = items.map((item, index) => {
		const card = document.createElement('button');
		card.className = 'asset-card glass-card';
		card.type = 'button';
		card.setAttribute('aria-label', `View ${label.toLowerCase()} image ${index + 1}`);
		const image = document.createElement('img');
		image.src = item.src;
		image.alt = item.alt;
		image.loading = 'lazy';
		const caption = document.createElement('span');
		caption.className = 'asset-placeholder';
		caption.textContent = label;
		const action = document.createElement('span');
		action.className = 'asset-action';
		action.setAttribute('aria-hidden', 'true');
		action.textContent = '↗';
		card.append(image, caption, action);
		card.addEventListener('click', () => {
			const sources = cards.map((item) => ({
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
	createAssetCards(gallery, assetGalleries[gallery.dataset.assetGallery]);
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		if (imageViewer.open) closeViewer();
		else if (albumModal.open) closeAlbum();
		else if (conciergePanel && !conciergePanel.hidden) closeConcierge();
	}
	if (!imageViewer.open) return;
	if (event.key === 'ArrowLeft') moveViewer(-1);
	if (event.key === 'ArrowRight') moveViewer(1);
	if (event.key === '+' || event.key === '=') zoomViewer(.5);
	if (event.key === '-') zoomViewer(-.5);
	if (event.key === '0') {
		viewerZoom = 1;
		showViewerImage();
	}
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
	if (fields.get('consent') !== 'on') {
		formStatus.textContent = 'Please consent to include these details before preparing the email draft.';
		return;
	}
	formStatus.textContent = 'Your email app should open a draft. Review and send it yourself; this website has not submitted or stored your inquiry.';
	window.location.href = `mailto:dan.daman@duretti-yachts.com?cc=${encodeURIComponent('selva@duretti-yachts.com')}&subject=${encodeURIComponent('DURETTI Yachts inquiry')}&body=${encodeURIComponent(body)}`;
});

const conciergePanel = document.querySelector('#concierge-panel');
const conciergeLauncher = document.querySelector('.concierge-launcher');
const conciergeAvailability = document.querySelector('[data-concierge-availability]');
const conciergeMessages = document.querySelector('.concierge-messages');
const conciergeTyping = document.querySelector('.concierge-typing');
const conciergeComposer = document.querySelector('.concierge-composer');
const conciergeInput = document.querySelector('#concierge-input');
const conciergeSend = document.querySelector('.concierge-send');
const conciergeNewButton = document.querySelector('.concierge-new');
const conciergeBody = document.querySelector('.concierge-body');
const conciergeLead = document.querySelector('.concierge-lead');
const conciergeLeadStatus = document.querySelector('.concierge-lead-status');
const conciergeSetupNote = document.querySelector('.concierge-setup-note');
const conciergeWelcome = "Welcome to DURETTI Yachts. I'm your virtual yacht concierge, here to help you explore our collection, understand our customization options, and find the right vessel for your needs.\n\nWhat would you like to discover today?";
const conciergePrompts = [
	['Explore Our Yacht Models', 'Which yacht models are featured, and where can I explore the models shown on this website?'],
	['Compare Yacht Options', 'How should I choose between DURETTI yacht options for my intended use?'],
	['Customization & Design', 'What customization and interior design options can I discuss with DURETTI?'],
	['Warranty & Quality', 'What does DURETTI say about its quality standards, safety, and hull warranty?'],
	['Request a Quotation', 'I would like to request a yacht quotation. What details should I prepare?']
];
let conciergeHistory = [];
let conciergeIsSending = false;

function setConciergeStatus(isConfigured, state = 'unavailable') {
	conciergeAvailability.classList.toggle('is-configured', isConfigured);
	conciergeAvailability.classList.toggle('is-unavailable', state === 'unavailable');
	conciergeAvailability.querySelector('span').textContent = isConfigured ? 'AI setup detected' : state === 'checking' ? 'Checking setup' : 'AI service not connected';
	conciergeSetupNote.hidden = isConfigured || state === 'checking';
}

async function checkConciergeConfiguration() {
	setConciergeStatus(false, 'checking');
	if (window.location.protocol === 'file:') {
		setConciergeStatus(false);
		return;
	}
	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), 5000);
	try {
		const response = await fetch('api/concierge', { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal });
		const result = await response.json();
		setConciergeStatus(response.ok && result.configured === true);
	} catch {
		setConciergeStatus(false);
	} finally {
		window.clearTimeout(timeout);
	}
}

function scrollConcierge(force = false) {
	const distanceFromBottom = conciergeMessages.scrollHeight - conciergeMessages.scrollTop - conciergeMessages.clientHeight;
	if (force || distanceFromBottom < 100) conciergeMessages.scrollTop = conciergeMessages.scrollHeight;
}

function resizeConciergeInput() {
	conciergeInput.style.height = 'auto';
	conciergeInput.style.height = `${Math.min(120, Math.max(42, conciergeInput.scrollHeight))}px`;
}

function addConciergeMessage(role, content, options = {}) {
	const wasNearBottom = conciergeMessages.scrollHeight - conciergeMessages.scrollTop - conciergeMessages.clientHeight < 100;
	const item = document.createElement('li');
	item.className = `concierge-message is-${role}${options.error ? ' is-error' : ''}`;
	const bubble = document.createElement('p');
	bubble.className = 'concierge-message-bubble';
	bubble.textContent = content;
	item.append(bubble);

	if (role === 'assistant' && !options.welcome) {
		const tools = document.createElement('div');
		tools.className = 'concierge-message-tools';
		if (options.error) {
			const retry = document.createElement('button');
			retry.type = 'button';
			retry.textContent = 'Try again';
			retry.setAttribute('aria-label', 'Retry sending your last question');
			retry.addEventListener('click', () => {
				item.remove();
				sendConciergeMessage(options.retryMessage, options.userMessage, true);
			});
			tools.append(retry);
		} else {
			const copy = document.createElement('button');
			copy.type = 'button';
			copy.textContent = 'Copy answer';
			copy.setAttribute('aria-label', 'Copy this concierge answer');
			copy.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(content);
					copy.textContent = 'Copied';
				} catch {
					copy.textContent = 'Copy unavailable';
				}
			});
			tools.append(copy);
			if (options.followupPrompt) {
				const followup = document.createElement('button');
				followup.type = 'button';
				followup.textContent = 'Ask a follow-up';
				followup.setAttribute('aria-label', `Ask a follow-up: ${options.followupPrompt}`);
				followup.addEventListener('click', () => sendConciergeMessage(options.followupPrompt));
				tools.append(followup);
			}
		}
		item.append(tools);
	}

	conciergeMessages.append(item);
	scrollConcierge(role === 'user' || wasNearBottom || options.welcome);
	return item;
}

function showConciergeWelcome() {
	conciergeMessages.replaceChildren();
	const item = document.createElement('li');
	item.className = 'concierge-welcome';
	const greeting = document.createElement('p');
	greeting.textContent = conciergeWelcome;
	const suggestions = document.createElement('div');
	suggestions.className = 'concierge-suggestions';
	suggestions.setAttribute('aria-label', 'Suggested questions');
	conciergePrompts.forEach(([label, prompt]) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		button.addEventListener('click', () => sendConciergeMessage(prompt));
		suggestions.append(button);
	});
	item.append(greeting, suggestions);
	conciergeMessages.append(item);
	scrollConcierge(true);
}

function conciergeFollowUp(message) {
	const question = message.toLowerCase();
	if (/\b(price|pricing|cost|quote|quotation|purchase|buy|financ\w*|payment)\b/.test(question)) {
		return 'What details should I prepare for a yacht quotation request?';
	}
	if (/\b(custom|interior|layout|finish|material|design)\b/.test(question)) {
		return 'What customization preferences should I discuss with the DURETTI team?';
	}
	if (/\b(warranty|safety|quality|resale|value)\b/.test(question)) {
		return 'Which warranty or safety details should I confirm directly with DURETTI?';
	}
	if (/\b(model|compare|size|feet|boat|yacht|vessel)\b/.test(question)) {
		return 'What information should I consider when choosing a DURETTI model?';
	}
	return 'What technical specifications can I request from the DURETTI team?';
}

function openConcierge() {
	conciergePanel.hidden = false;
	conciergeLauncher.setAttribute('aria-expanded', 'true');
	conciergePanel.closest('.concierge').classList.add('is-open');
	conciergeInput.focus();
	syncConciergeVisualViewport();
}

function closeConcierge() {
	if (conciergePanel.hidden) return;
	conciergePanel.hidden = true;
	conciergeLauncher.setAttribute('aria-expanded', 'false');
	conciergePanel.closest('.concierge').classList.remove('is-open');
	conciergeLead.hidden = true;
	conciergeBody.classList.remove('is-form');
	conciergeComposer.hidden = false;
	syncConciergeVisualViewport();
	conciergeLauncher.focus();
}

function openConciergeLead() {
	conciergeLead.hidden = false;
	conciergeBody.classList.add('is-form');
	conciergeComposer.hidden = true;
	conciergeLeadStatus.textContent = '';
	conciergeLead.querySelector('[name="name"]').focus();
}

function closeConciergeLead() {
	conciergeLead.hidden = true;
	conciergeBody.classList.remove('is-form');
	conciergeComposer.hidden = false;
	conciergeInput.focus();
}

function syncConciergeVisualViewport() {
	const viewport = window.visualViewport;
	const hasReducedViewport = viewport && (viewport.offsetTop > 1 || viewport.height < window.innerHeight - 40);
	if (!viewport || window.innerWidth > 600 || conciergePanel.hidden || !hasReducedViewport) {
		conciergePanel.style.removeProperty('--concierge-visual-top');
		conciergePanel.style.removeProperty('--concierge-visual-height');
		return;
	}
	conciergePanel.style.setProperty('--concierge-visual-top', `${viewport.offsetTop}px`);
	conciergePanel.style.setProperty('--concierge-visual-height', `${viewport.height}px`);
}

async function sendConciergeMessage(rawMessage, existingUserMessage = null, isRetry = false) {
	const message = String(rawMessage || '').trim();
	if (!message || conciergeIsSending) return;
	const userMessage = existingUserMessage || addConciergeMessage('user', message);
	conciergeInput.value = '';
	resizeConciergeInput();
	conciergeIsSending = true;
	conciergeSend.disabled = true;
	conciergeNewButton.disabled = true;
	conciergeTyping.hidden = false;
	conciergeInput.readOnly = true;
	conciergeMessages.setAttribute('aria-busy', 'true');
	const shouldScroll = conciergeMessages.scrollHeight - conciergeMessages.scrollTop - conciergeMessages.clientHeight < 140;
	if (shouldScroll || isRetry) scrollConcierge(true);

	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), 25000);
	try {
		if (window.location.protocol === 'file:') {
			throw new Error('The live AI concierge needs the website to be hosted with its /api/concierge endpoint. You can contact the DURETTI team using the email option below.');
		}
		const response = await fetch('api/concierge', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({ message, history: conciergeHistory.slice(-8) }),
			signal: controller.signal
		});
		const result = await response.json().catch(() => null);
		if (!response.ok) {
			if (response.status === 404 || response.status >= 500) setConciergeStatus(false);
			throw new Error(typeof result?.error === 'string' ? result.error : 'The concierge service is not configured at this website address. Please contact the DURETTI team using the email option below.');
		}
		if (typeof result?.answer !== 'string' || !result.answer.trim()) throw new Error('The concierge returned an unreadable reply. Please try again or contact the DURETTI team.');
		conciergeHistory.push({ role: 'user', content: message }, { role: 'assistant', content: result.answer });
		conciergeHistory = conciergeHistory.slice(-8);
		addConciergeMessage('assistant', result.answer, { followupPrompt: conciergeFollowUp(message) });
	} catch (error) {
		if (error.name === 'AbortError' || error instanceof TypeError) setConciergeStatus(false);
		const errorMessage = error.name === 'AbortError'
			? 'The reply took too long. Please try again or contact the DURETTI team.'
			: error instanceof TypeError
				? 'The live AI service could not be reached. No inquiry has been submitted or stored by this website. You can contact the DURETTI team using the email option below.'
				: error.message || 'The AI service could not be reached. No inquiry has been submitted or stored by this website. You can email the DURETTI team using the contact option below.';
		addConciergeMessage('assistant', errorMessage, { error: true, retryMessage: message, userMessage });
	} finally {
		window.clearTimeout(timeout);
		conciergeIsSending = false;
		conciergeSend.disabled = false;
		conciergeNewButton.disabled = false;
		conciergeInput.readOnly = false;
		conciergeTyping.hidden = true;
		conciergeMessages.setAttribute('aria-busy', 'false');
	}
}

conciergeLauncher.addEventListener('click', () => {
	if (conciergePanel.hidden) openConcierge();
	else closeConcierge();
});
document.querySelector('.concierge-close').addEventListener('click', closeConcierge);
conciergeNewButton.addEventListener('click', () => {
	conciergeHistory = [];
	conciergeLead.reset();
	closeConciergeLead();
	showConciergeWelcome();
	conciergeInput.focus();
});
document.querySelector('.concierge-back').addEventListener('click', closeConciergeLead);
conciergeComposer.addEventListener('submit', (event) => {
	event.preventDefault();
	sendConciergeMessage(conciergeInput.value);
});
conciergeInput.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
	event.preventDefault();
	conciergeComposer.requestSubmit();
});
conciergeInput.addEventListener('input', resizeConciergeInput);
document.querySelectorAll('[data-concierge-action]').forEach((button) => {
	button.addEventListener('click', () => {
		if (button.dataset.conciergeAction === 'quotation') {
			openConciergeLead();
			return;
		}
		sendConciergeMessage('Please help me request technical specifications for a DURETTI yacht. What information should I provide?');
	});
});
conciergeLead.addEventListener('submit', (event) => {
	event.preventDefault();
	const fields = new FormData(conciergeLead);
	if (fields.get('consent') !== 'on') {
		conciergeLeadStatus.textContent = 'Please confirm consent before preparing the email draft.';
		return;
	}
	const body = [
		'Hello DURETTI team,',
		'',
		'I would like to discuss a yacht inquiry.',
		`Name: ${fields.get('name')}`,
		`Email: ${fields.get('email')}`,
		`Country or region: ${fields.get('region') || 'Not provided'}`,
		`Preferred yacht model: ${fields.get('model') || 'Not provided'}`,
		`Intended use: ${fields.get('use') || 'Not provided'}`,
		'Specifications or customization:',
		String(fields.get('details') || 'Not provided'),
		'',
		'Please let me know the next steps.'
	].join('\n');
	const subject = fields.get('model') ? `DURETTI yacht inquiry - ${fields.get('model')}` : 'DURETTI yacht inquiry';
	conciergeLeadStatus.textContent = 'Your email app should open a draft. Review and send it yourself; this website has not submitted or stored your inquiry.';
	window.location.href = `mailto:dan.daman@duretti-yachts.com?cc=${encodeURIComponent('selva@duretti-yachts.com')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

if (window.visualViewport) {
	window.visualViewport.addEventListener('resize', syncConciergeVisualViewport);
	window.visualViewport.addEventListener('scroll', syncConciergeVisualViewport);
}
window.addEventListener('resize', syncConciergeVisualViewport);
showConciergeWelcome();
checkConciergeConfiguration();
