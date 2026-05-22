async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/hunter/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        industry: "B2B SaaS",
        country: "USA",
        limit: 5
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
