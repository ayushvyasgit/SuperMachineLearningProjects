const url = "http://localhost:5000/api/search";

async function testSearch() {
  console.log("Sending search request...");
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'cow with high fever and coughing' })
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! status: ${response.status}, body: ${text}`);
      return;
    }
    
    const data = await response.json();
    console.log("Full Response:", JSON.stringify({
      success: data.success,
      query: data.query,
      medicinesFound: data.medicinesFound,
      topK: data.searchResults?.length,
      topResults: data.searchResults?.slice(0, 3).map(r => ({ medicine: r.medicine, score: r.score })),
      aiSnippet: data.aiResponse?.substring(0, 300),
    }, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testSearch();
