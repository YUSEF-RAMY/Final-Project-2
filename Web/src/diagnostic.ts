
console.log("--- API Diagnostic Report ---");
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Full Login URL:", `${import.meta.env.VITE_API_BASE_URL}/login`);
console.log("-----------------------------");

if (!import.meta.env.VITE_API_BASE_URL) {
  console.error("FATAL ERROR: VITE_API_BASE_URL is undefined. Requests will fail!");
}

if (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.startsWith('https')) {
  console.warn("WARNING: API URL does not start with https. Browser may block mixed content.");
}
