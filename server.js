const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = "0.0.0.0";
const MAX_BODY_SIZE = 12 * 1024 * 1024;
const XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions";
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
  const apiKey = process.env.GrokAPIKey;

  if (!question || !imageData) {
    sendJson(response, 400, { error: "Select an image and enter a question first." });
    return;
  }
  if (!apiKey) {
    sendJson(response, 503, { error: "GrokAPIKey is not configured in Replit Secrets." });
    return;
  }

  try {
    const apiResponse = await fetch(XAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and answer: ${question}. Keep your response short and concise.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageData}` },
            },
          ],
        }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    const data = await apiResponse.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!apiResponse.ok || !answer) {
      const message = data.error?.message || "The Grok request failed.";
      console.error(`Grok API response ${apiResponse.status}: ${message}`);
      sendJson(response, 502, { error: message });
      return;
    }
    sendJson(response, 200, { answer });
  } catch (error) {
    console.error("Grok request failed:", error.message);
    sendJson(response, 502, { error: "Grok did not respond. Please try again." });
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