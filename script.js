// Cleffa Mascot Implementation
function setMascotImage(baseName) {
  const mascotImg = document.getElementById('cleffa');
  if (!mascotImg) return;

  // Make Cleffa shiny 1 in 4096 chance
  const isSpecial = Math.floor(Math.random() * 4096) === 0; // Returns true only 1 time in 4096

  const imageName = isSpecial ? `${baseName}_s` : baseName;

  mascotImg.src = `./assets/${imageName}.png`;

  if (isSpecial) {
    mascotImg.classList.add('special'); // Add animation for shiny cleffa
  } else {
    mascotImg.classList.remove('special'); // No animation for normal cleffa
  }
}




const COMBINED_DECKS_PATH = './combined-decks.json';
const THUMBNAILS_PATH = './thumbnails/';
let cardFrequencyMap = {}; // Store card frequencies globally

async function loadDecks() {
  const response = await fetch(COMBINED_DECKS_PATH);
  return await response.json();
}

async function createCardFrequencyMap() {
  const decks = await loadDecks(); // Load all decks
  cardFrequencyMap = {}; // Reset the frequency map

  decks.forEach(deck => {
    const uniqueCards = new Set(); // Store unique card names for this deck

    ['main', 'side', 'extra'].forEach(section => {
      (deck[section] || []).forEach(card => {
        uniqueCards.add(card.name.toLowerCase()); // Add card name to set (automatically avoids duplicates)
      });
    });

    // Increment the count for each unique card in this deck
    uniqueCards.forEach(cardName => {
      cardFrequencyMap[cardName] = (cardFrequencyMap[cardName] || 0) + 1;
    });
  });
}


async function populateFilters() {
  const decks = await loadDecks();
  const deckbuilders = new Set();
  const decktypes = new Set();

  decks.forEach(deck => {
    if (deck.builderName) deckbuilders.add(deck.builderName);
    if (deck.deckTypeName) decktypes.add(deck.deckTypeName);
  });

  populateDropdown('deckbuilder-filter', Array.from(deckbuilders));
  populateDropdown('decktype-filter', Array.from(decktypes));
}

function populateDropdown(filterId, options) {
  const selectElement = document.getElementById(filterId);
  if (!selectElement) {
    console.error(`Dropdown with ID '${filterId}' not found.`);
    return;
  }
  options.sort().forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    selectElement.appendChild(opt);
  });
}

function sortDecks(decks, sortOption) {
  switch (sortOption) {
    case 'new-to-old':
      return decks.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    case 'old-to-new':
      return decks.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
    case 'place-high-to-low':
      return decks.sort((a, b) => (a.placement || Infinity) - (b.placement || Infinity));
    case 'place-low-to-high':
      return decks.sort((a, b) => (b.placement || Infinity) - (a.placement || Infinity));
    case 'downloads-high-to-low':
      return decks.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    case 'downloads-low-to-high':
      return decks.sort((a, b) => (a.downloads || 0) - (b.downloads || 0));
    case 'builder-a-to-z':
      return decks.sort((a, b) => (a.builderName || '').localeCompare(b.builderName || ''));
    case 'builder-z-to-a':
      return decks.sort((a, b) => (b.builderName || '').localeCompare(a.builderName || ''));
    default:
      return decks;
  }
}

document.addEventListener('DOMContentLoaded', async () => {

  setMascotImage('cleffa');

  await createCardFrequencyMap(); // Build the card frequency map
  populateFilters();

  document.querySelector('.add-query-btn').addEventListener('click', addSearchBox);
  document.getElementById('search-box-container').addEventListener('input', () => searchDecks());

  ['deckbuilder-filter', 'decktype-filter', 'placement-filter', 'sort-filter', 'search-scope-filter'].forEach(id => {
    const filterElement = document.getElementById(id);
    if (filterElement) {
      filterElement.addEventListener('change', () => searchDecks());
    }
  });

  const spiceThresholdInput = document.getElementById('spice-threshold');
  const spiceToggleCheckbox = document.getElementById('spice-toggle');

  if (spiceThresholdInput) {
    spiceThresholdInput.addEventListener('input', () => {
      if (spiceThresholdInput.value.trim() !== '') {
        spiceToggleCheckbox.checked = true;
        searchDecks();
      }
    });
  }

  if (spiceToggleCheckbox) {
    spiceToggleCheckbox.addEventListener('change', () => {
      if (!spiceToggleCheckbox.checked) {
        spiceThresholdInput.value = '';
      }
      searchDecks();
    });
  }
});




// Function to add a new search box
function addSearchBox() {
  const container = document.getElementById('search-box-container');
  const newSearchBox = document.createElement('div');
  newSearchBox.className = 'search-box';
  newSearchBox.innerHTML = `
    <input type="text" class="search-bar" placeholder="Search for cards...">
    <button type="button" class="remove-query-btn">-</button>
  `;
  container.appendChild(newSearchBox);

  // Add event listener for removing a search box
  newSearchBox.querySelector('.remove-query-btn').addEventListener('click', () => {
    newSearchBox.remove();
    searchDecks(); // Update search results after removing a query
  });
}


function getSearchQueries() {
  const searchBars = document.querySelectorAll('.search-bar');
  const queries = { positive: [], negative: [] };

  Array.from(searchBars).forEach(input => {
    const query = input.value.trim().toLowerCase();

    if (query.startsWith('not:event:')) {
      const eventQuery = query.replace('not:event:', '').trim();
      if (eventQuery) queries.negative.push({ type: 'event', event: eventQuery });
    } else if (query.startsWith('event:')) {
      const eventQuery = query.replace('event:', '').trim();
      if (eventQuery) queries.positive.push({ type: 'event', event: eventQuery });
    } else if (query.startsWith('not:')) {
      const negQuery = query.replace('not:', '').trim();
      if (negQuery.match(/^(\d+)\s+(.+)$/)) {
        const [, count, cardName] = negQuery.match(/^(\d+)\s+(.+)$/);
        queries.negative.push({ type: 'count', count: parseInt(count), cardName: cardName.replace(/"/g, '') });
      } else if (negQuery.startsWith('"') && negQuery.endsWith('"')) {
        queries.negative.push({ type: 'exact-name', cardName: negQuery.slice(1, -1) }); // Remove quotes
      } else if (negQuery) {
        queries.negative.push({ type: 'name', cardName: negQuery });
      }
    } else if (query.match(/^(\d+)\s+(.+)$/)) {
      const [, count, cardName] = query.match(/^(\d+)\s+(.+)$/);
      queries.positive.push({ type: 'count', count: parseInt(count), cardName: cardName.replace(/"/g, '') }); // Remove quotes if present
    } else if (query.startsWith('"') && query.endsWith('"')) {
      queries.positive.push({ type: 'exact-name', cardName: query.slice(1, -1) }); // Exact match for quoted text
    } else if (query) {
      queries.positive.push({ type: 'name', cardName: query });
    }
  });

  return queries;
}



let lastSearchTime = 0; // Global variable to track the latest search request time

async function searchDecks() {
  const currentSearchTime = Date.now();
  lastSearchTime = currentSearchTime;

  const searchResultsContainer = document.getElementById('search-results');
  const loadingIndicator = document.getElementById('loading-indicator');
  const resultsCountElement = document.getElementById('results-count');

  loadingIndicator.classList.remove('hidden');
  resultsCountElement.classList.add('hidden');

  try {
    while (searchResultsContainer.firstChild) {
      searchResultsContainer.removeChild(searchResultsContainer.firstChild);
    }

    const decks = await loadDecks();
    if (lastSearchTime !== currentSearchTime) return;

    const queries = getSearchQueries();
    const deckbuilderFilter = document.getElementById('deckbuilder-filter')?.value.toLowerCase() || '';
    const decktypeFilter = document.getElementById('decktype-filter')?.value.toLowerCase() || '';
    const placementFilter = document.getElementById('placement-filter')?.value || '';
    const sortOption = document.getElementById('sort-filter')?.value || '';
    const searchScope = document.getElementById('search-scope-filter')?.value || 'main-side-extra';

    let spiceThreshold = parseInt(document.getElementById('spice-threshold')?.value) || 1;
    const spiceToggle = document.getElementById('spice-toggle')?.checked;

    if (spiceToggle && !document.getElementById('spice-threshold').value.trim()) {
      spiceThreshold = 1; // Reset to 1 if threshold is empty
      document.getElementById('spice-threshold').value = '1';
    }

    spiceThreshold += 1; // Increment threshold for n + 1 logic

    let sectionsToSearch = [];
    switch (searchScope) {
      case 'main':
        sectionsToSearch = ['main'];
        break;
      case 'side':
        sectionsToSearch = ['side'];
        break;
      case 'main-side-extra':
      default:
        sectionsToSearch = ['main', 'side'];
        break;
    }

    const filteredDecks = decks.filter(deck => {
      const matchesBuilder = !deckbuilderFilter || (deck.builderName && deck.builderName.toLowerCase() === deckbuilderFilter);
      const matchesType = !decktypeFilter || (deck.deckTypeName && deck.deckTypeName.toLowerCase() === decktypeFilter);
      const matchesPlacement = !placementFilter || (deck.placement && deck.placement.toString() === placementFilter);
      return matchesBuilder && matchesType && matchesPlacement;
    });

    const matchingDecks = filteredDecks.filter(deck => {
      const allCards = sectionsToSearch.reduce((acc, section) => acc.concat(deck[section] || []), []);
      const spicyCardsSet = new Set(
        allCards.filter(card => cardFrequencyMap[card.name.toLowerCase()] < spiceThreshold).map(card => card.name)
      );

      const spicyCards = Array.from(spicyCardsSet); // Ensure unique spicy cards

      const matchesAllPositive = queries.positive.every(query => {
        if (query.type === 'count') {
          const cardCount = allCards.filter(card => card.name.toLowerCase() === query.cardName).length;
          return cardCount === query.count;
        } else if (query.type === 'exact-name') {
          return allCards.some(card => card.name.toLowerCase() === query.cardName);
        } else if (query.type === 'name') {
          return allCards.some(card => card.name.toLowerCase().includes(query.cardName));
        } else if (query.type === 'event') {
          return deck.eventAbbreviation && deck.eventAbbreviation.toLowerCase().includes(query.event);
        }
      });

      const matchesAnyNegative = queries.negative.some(query => {
        if (query.type === 'count') {
          const cardCount = allCards.filter(card => card.name.toLowerCase() === query.cardName).length;
          return cardCount === query.count;
        } else if (query.type === 'exact-name') {
          return allCards.some(card => card.name.toLowerCase() === query.cardName);
        } else if (query.type === 'name') {
          return allCards.some(card => card.name.toLowerCase().includes(query.cardName));
        } else if (query.type === 'event') {
          return deck.eventAbbreviation && deck.eventAbbreviation.toLowerCase().includes(query.event);
        }
      });

      if (spiceToggle && spicyCards.length === 0) return false; // Skip if no spicy cards

      return matchesAllPositive && !matchesAnyNegative;
    });

    const sortedDecks = sortDecks(matchingDecks, sortOption);
    resultsCountElement.textContent = `${sortedDecks.length} Decks Found`;
    resultsCountElement.classList.remove('hidden');

    sortedDecks.forEach(deck => {
      const container = document.createElement('div');
      container.className = 'deck-result';

      const link = document.createElement('a');
      link.href = `https://formatlibrary.com/decks/${deck.id}`;
      link.target = '_blank';

      const img = document.createElement('img');
      img.src = `${THUMBNAILS_PATH}${deck.id}.png`;
      img.className = 'thumbnail';

      img.onerror = () => {
        if (img.src !== './assets/brokenimg.png') {
          img.src = './assets/brokenimg.png';
        }
      };

      const deckInfo = document.createElement('div');
      deckInfo.className = 'deck-info';
      deckInfo.textContent = `${deck.eventAbbreviation || 'Unknown Event'} · ${deck.builderName || 'Unknown Builder'} · ${deck.placement ? `${deck.placement}${getOrdinalSuffix(deck.placement)}` : 'Unknown Placement'}`;

      link.appendChild(img);
      container.appendChild(link);
      container.appendChild(deckInfo);

      if (spiceToggle) {
        const allCards = sectionsToSearch.reduce((acc, section) => acc.concat(deck[section] || []), []);
        const spicyCardsSet = new Set(
          allCards.filter(card => cardFrequencyMap[card.name.toLowerCase()] < spiceThreshold).map(card => card.name)
        );

        const spicyCards = Array.from(spicyCardsSet);

        if (spicyCards.length > 0) {
          const spiceDescription = document.createElement('div');
          spiceDescription.className = 'spice-description';
          spiceDescription.textContent = `🌶️ ${spicyCards.join(', ')}`;
          container.appendChild(spiceDescription);
        }
      }

      searchResultsContainer.appendChild(container);
    });
  } catch (error) {
    console.error('Error during search:', error);
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}




// Helper function to get ordinal suffix for placement (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num) {
  if (isNaN(num)) return ''; // Return an empty string if the input is not a number

  const remainder100 = num % 100;
  const remainder10 = num % 10;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return 'th'; // Special cases: 11th, 12th, 13th
  }

  switch (remainder10) {
    case 1:
      return 'st'; // 1st, 21st, 31st, etc.
    case 2:
      return 'nd'; // 2nd, 22nd, 32nd, etc.
    case 3:
      return 'rd'; // 3rd, 23rd, 33rd, etc.
    default:
      return 'th'; // Default case: 4th, 5th, 6th, etc.
  }
}
