const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = "0.0.0.0";
const MAX_BODY_SIZE = 12 * 1024 * 1024;
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const PUBLIC_DIR = __dirname;

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
        reject(new Error("Request is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function extractRelatedFoods(answer) {
  const relatedMatch = answer.match(/Related Foods:\s*([^\n]+)/i);
  if (relatedMatch) {
    return relatedMatch[1].split(',').map(f => f.trim()).filter(f => f);
  }
  return [];
}

async function analyzeImage(request, response) {
  let payload;
  try {
    payload = JSON.parse(await readBody(request));
  } catch (error) {
    sendJson(response, error.message === "Request is too large." ? 413 : 400, {
      error: error.message === "Request is too large." ? error.message : "Invalid request data.",
    });
    return;
  }

  const question = String(payload.question || "").trim();
  const imageData = String(payload.imageData || "").trim();
  const mimeType = String(payload.mimeType || "image/jpeg");
  const apiKey = process.env.GPTKEey;

  if (!question || !imageData) {
    sendJson(response, 400, { error: "Select an image and enter a question first." });
    return;
  }
  if (!apiKey) {
    sendJson(response, 503, { error: "GPTKEey is not configured in Replit Secrets." });
    return;
  }

  try {
    const apiResponse = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image. Answer the question: "${question}". Then, suggest 3-5 related foods or dishes that pair well with this food. Format your response as:
              
              Answer: [your answer to the question]
              
              Related Foods: [comma-separated list of 3-5 related foods]
              
              Keep your response concise and informative.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageData}` },
            },
          ],
        }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await apiResponse.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!apiResponse.ok || !answer) {
      const message = typeof data.error === "string"
        ? data.error
        : data.error?.message || data.message || "The Mistral request failed.";
      console.error(`Mistral API response ${apiResponse.status}: ${message}`);
      sendJson(response, 502, { error: message });
      return;
    }
    sendJson(response, 200, { answer, relatedFoods: extractRelatedFoods(answer) });
  } catch (error) {
    console.error("Mistral request failed:", error.message);
    sendJson(response, 502, { error: "Mistral did not respond. Please try again." });
  }
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found.");
      return;
    }
    response.writeHead(200);
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/analyze") {
    await analyzeImage(request, response);
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }
  sendJson(response, 405, { error: "Method not allowed." });
});

server.listen(PORT, HOST, () => {
  console.log(`Gallery server listening on ${HOST}:${PORT}`);
});