const apiKey = process.env.GEMINI_API_KEY;

const models = [
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemma-4-31b-it",
];

async function test() {
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }),
        signal: controller.signal
      });
      clearTimeout(id);
      console.log(`[${m}] Status: ${res.status} ${res.statusText}`);
      if (!res.ok) {
         const json = await res.json();
         console.log(`[${m}] Error: ${json.error?.message}`);
      }
    } catch (e: any) {
      console.log(`[${m}] Error: ${e.name} ${e.message}`);
    }
  }
}

test();
