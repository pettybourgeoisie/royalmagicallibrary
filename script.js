// Function to fetch all decks and display in the table
async function fetchAllDecks() {
  let allDecks = [];
  let limit = 100;
  let offset = 0;
  let totalFetched = 0;

  while (true) {
    let response = await fetch(`https://formatlibrary.com/api/decks?limit=${limit}&offset=${offset}&filter=format:eq:Goat`);
    let data = await response.json();

    if (data.length === 0) break; // Stop fetching if no decks are returned

    allDecks.push(...data);
    totalFetched += data.length;
    offset += limit;
  }

  console.log(`Fetched ${totalFetched} decks`);
  displayDecks(allDecks);
}

// Function to display decks in the table
function displayDecks(decks) {
  const tableBody = document.querySelector("#decksTable tbody");
  tableBody.innerHTML = ''; // Clear the table

  decks.forEach(deck => {
    let row = tableBody.insertRow();
    row.innerHTML = `
      <td>${deck.name}</td>
      <td>${deck.format}</td>
      <td>${deck.creator}</td>
      <td>${deck.cards.length}</td>
    `;
  });
}

// Attach click event to fetch decks
document.getElementById("fetchDecksButton").addEventListener("click", fetchAllDecks);
