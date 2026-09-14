import base64
import json
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


HOST = "0.0.0.0"
PORT = 5000
XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions"


def secret_value():
    # Support the existing Replit Secret name and the conventional name.
    return os.environ.get("GrokAPIKey") or os.environ.get("GrokAPIKEy") or os.environ.get("XAI_API_KEY")


class GalleryHandler(SimpleHTTPRequestHandler):
    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/analyze":
            self.send_json({"error": "Not found."}, 404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 12 * 1024 * 1024:
                self.send_json({"error": "The request is missing or exceeds the image size limit."}, 413)
                return

            payload = json.loads(self.rfile.read(content_length))
            question = str(payload.get("question", "")).strip()
            image_data = str(payload.get("imageData", "")).strip()
            if not question or not image_data:
                self.send_json({"error": "Select an image and enter a question first."}, 400)
                return

            api_key = secret_value()
            if not api_key:
                self.send_json({"error": "The Grok API secret is not configured in Replit Secrets."}, 503)
                return

            image_ext = "jpeg"
            if image_data:
                header_match = re.search(r'^data:image/(\w+);base64,', image_data)
                if header_match:
                    image_ext = header_match.group(1)
            
            request_body = {
                "model": "grok-2-vision-preview",
                "messages": [{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Analyze this image and answer: {question}. Keep your response short and concise.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/{image_ext};base64,{image_data}"},
                        },
                    ],
                }],
                "max_tokens": 200,
                "temperature": 0.7,
            }
            request = Request(
                XAI_ENDPOINT,
                data=json.dumps(request_body).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urlopen(request, timeout=60) as api_response:
                result = json.loads(api_response.read())

            answer = result.get("choices", [{}])[0].get("message", {}).get("content")
            if not answer:
                self.send_json({"error": "Grok returned an unexpected response."}, 502)
                return
            self.send_json({"answer": answer})
        except json.JSONDecodeError:
            self.send_json({"error": "Invalid request data."}, 400)
        except HTTPError as error:
            try:
                details = json.loads(error.read().decode("utf-8"))
                message = details.get("error", {}).get("message", "The Grok request failed.")
            except (json.JSONDecodeError, UnicodeDecodeError):
                message = "The Grok request failed."
            self.send_json({"error": message}, 502)
        except (URLError, TimeoutError):
            self.send_json({"error": "Grok did not respond in time."}, 504)
        except Exception:
            self.send_json({"error": "The analysis request could not be completed."}, 500)


if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), GalleryHandler).serve_forever()