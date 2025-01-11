// Function to fetch all decks and display in the table
async function fetchAllDecks() {
  let allDecks = [];
  let limit = 100; // Max decks per request
  let offset = 0; // Starting offset
  let totalFetched = 0;

  try {
    // Loop to fetch all decks in batches of 100
    while (true) {
      let response = await fetch(`http://localhost:8080/api/decks?limit=${limit}&offset=${offset}&filter=format:eq:Goat`);
      
      // Parse the JSON response
      let data = await response.json();

      if (data.length === 0) break; // Stop if no more decks are returned

      allDecks.push(...data); // Add fetched decks to the list
      totalFetched += data.length;
      offset += limit; // Increment offset for the next batch
    }

    console.log(`Fetched ${totalFetched} decks`);
    displayDecks(allDecks); // Display decks in the table
  } catch (error) {
    console.error('Error fetching decks:', error);
  }
}

// Function to display decks in the table
function displayDecks(decks) {
  const tableBody = document.querySelector("#decksTable tbody");
  tableBody.innerHTML = ''; // Clear the table

  decks.forEach(deck => {
    let row = tableBody.insertRow(); // Create a new row
    row.innerHTML = `
      <td>${deck.name}</td>
      <td>${deck.format}</td>
      <td>${deck.creator}</td>
      <td>${deck.cards.length}</td>
    `;
  });
}

// Attach event listener to the button
document.getElementById("fetchDecksButton").addEventListener("click", fetchAllDecks);
