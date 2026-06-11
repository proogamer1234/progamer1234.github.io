const API_BASE = 'https://api.jikan.moe/v4';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('results-grid');
const loader = document.getElementById('loader');
const detailsOverlay = document.getElementById('details-overlay');
const detailsBody = document.getElementById('details-body');
const closeDetails = document.getElementById('close-details');

// Initialize Lucide Icons
lucide.createIcons();

// --- API Functions ---

async function searchAnime(query) {
    showLoader(true);
    resultsGrid.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=20`);
        const data = await response.json();
        renderCards(data.data);
    } catch (error) {
        console.error('Error fetching anime:', error);
        resultsGrid.innerHTML = '<p class="error">Something went wrong. Please try again.</p>';
    } finally {
        showLoader(false);
    }
}

async function getAnimeDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/anime/${id}/full`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

// --- UI Functions ---

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
}

function renderCards(animes) {
    if (!animes || animes.length === 0) {
        resultsGrid.innerHTML = '<p class="no-results">No anime found. Try another search!</p>';
        return;
    }

    animes.forEach((anime) => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${anime.images.webp.large_image_url}" alt="${anime.title}" class="card-img" loading="lazy">
            <div class="card-info">
                <h3 class="card-title">${anime.title}</h3>
                <div class="card-meta">
                    <span>${anime.type || 'N/A'}</span>
                    <span>★ ${anime.score || 'N/A'}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openDetails(anime.mal_id));
        resultsGrid.appendChild(card);
    });

    // Catchy GSAP Entrance
    gsap.from('.anime-card', {
        y: 50,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power3.out'
    });
}

async function openDetails(id) {
    const anime = await getAnimeDetails(id);
    if (!anime) return;

    detailsBody.innerHTML = `
        <img src="${anime.images.webp.large_image_url}" alt="${anime.title}" class="details-poster">
        <div class="info-pane">
            <h2 class="details-title">${anime.title}</h2>
            <div class="details-specs">
                <span class="spec-badge">${anime.type}</span>
                <span class="spec-badge">${anime.episodes} eps</span>
                <span class="spec-badge">${anime.status}</span>
                <span class="spec-badge">Score: ${anime.score}</span>
            </div>
            <p class="details-synopsis">${anime.synopsis || 'No synopsis available.'}</p>
            <div style="margin-top: 2rem;">
                <h4 style="color: white; margin-bottom: 0.5rem;">Genres</h4>
                <div class="details-specs">
                    ${anime.genres.map(g => `<span class="spec-badge" style="border-color: var(--primary)">${g.name}</span>`).join('')}
                </div>
            </div>
        </div>
    `;

    detailsOverlay.classList.remove('hidden');
    // Use requestAnimationFrame to ensure the 'active' transition triggers after 'hidden' is removed
    requestAnimationFrame(() => {
        detailsOverlay.classList.add('active');
    });

    document.body.style.overflow = 'hidden';

    // Animate content entrance
    gsap.from('.details-poster', {
        x: -50,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    });
    gsap.from('.info-pane > *', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
    });
}

function handleCloseDetails() {
    detailsOverlay.classList.remove('active');

    // Wait for transition to finish before adding hidden back
    setTimeout(() => {
        if (!detailsOverlay.classList.contains('active')) {
            detailsOverlay.classList.add('hidden');
        }
    }, 400);

    document.body.style.overflow = '';
}

// --- Event Listeners ---

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) searchAnime(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) searchAnime(query);
    }
});

closeDetails.addEventListener('click', handleCloseDetails);

// Close on backdrop click
detailsOverlay.addEventListener('click', (e) => {
    if (e.target.classList.contains('overlay-backdrop')) {
        handleCloseDetails();
    }
});

// Initial Search for trending/top anime
document.addEventListener('DOMContentLoaded', () => {
    searchAnime('Naruto'); // Default search
});
