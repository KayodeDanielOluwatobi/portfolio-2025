import { NextRequest, NextResponse } from 'next/server';

const fetchQuote = async () => {
  try {
    setFadeOut(true);

    // 1. Fetch your local JSON file
    const response = await fetch('/quotes.json'); 
    
    if (!response.ok) throw new Error('Failed to fetch quotes.json');

    const allQuotes = await response.json();

    // 2. Filter by your component's tags
    const tagsArray = tags.split(/[,|]/); // Splits by comma OR pipe
    const filteredQuotes = allQuotes.filter(q => tagsArray.includes(q.tag));

    // 3. Pick a random quote from the filtered list
    const fetchedQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

    if (!fetchedQuote) {
      throw new Error(`No quotes found for tags: ${tags}`);
    }
    
    // ... (rest of your logic)
    
  } catch (error) {
    // ...
  }
};