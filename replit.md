# Photo Gallery

This is a plain HTML, CSS, and JavaScript project with no package dependencies or build step.

## Run

Use the **Start application** workflow. It serves the project and the server-side Grok analysis endpoint on port 5000 with:

```sh
python3 server.py
```

The Grok API key must be stored in Replit Secrets. It is read only by `server.py`; it is never sent to browser JavaScript.