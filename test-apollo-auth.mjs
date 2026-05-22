import fetch from 'node-fetch'; // if available, or native fetch
const key = 'pWU8iIwLevr99IvhZfJbCA';

async function testHeader() {
  console.log("Testing X-Api-Key header...");
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': key
    },
    body: JSON.stringify({
      q_organization_keyword_tags: ["software"],
      person_locations: ["USA"],
      page: 1,
      per_page: 2
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}

testHeader();
