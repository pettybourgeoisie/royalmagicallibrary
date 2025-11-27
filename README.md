# royalmagicallibrary

LAST UPDATED: 26 November 2025

Have you ever wanted to search for all Goat Format Yugioh decks containing a particular card? Wanting to build a new Cyber-Stein OTK variant but wanting inspiration? Wondering whether your favorite card has ever topped a tournament before? This is a resource built on Format Library's API to more easily search the contents of Goat Format decks to answer questions like these. I hope that the search functionality enabled by this site will be adopted by Format Library and expanded!

Available Operators:
"NOT:" before a string will search for all decks that do not contain that string. For example, "NOT:Book of Moon" will search for all decks without Book of Moon. "NOT:Book of" will search for all decks without any card that contains the text "Book of".
"# " before a string will search for decks that contain that exact number of copies of a card that must be spelled out completely. For example, "2 Book of Moon" will find decks that contain exactly two copies of Book of Moon.
"EVENT:" before a string will search for decks that belong to a particular event. For example, "EVENT:PWCQ" will find all decks that belong to PWCQ tournaments.

By adding additional search boxes with the + button, you can refine the query further.

The "Spice Threshold" will automatically search for decks that contain cards that are not commonly found among the datapool. By clicking the "Only show spicy decks" button, it will default to show you decks with a named card that only appeared a single time. You can increase that number to show you spicy cards that appeared in at most that number of decks.

Anyone is free to use this code for whatever purpose. Consider contributing to the codebase to expand its functionality!
