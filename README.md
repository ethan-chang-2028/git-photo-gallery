# git-photo-gallery

A Food & Drink Gallery with AI-powered image analysis using Mistral AI.

## Features

- Browse food and drink images organized by category
- Select any image and ask questions about it
- AI analyzes the image using Mistral's vision model
- Get related food suggestions that pair well with the selected item

## Setup

1. **Mistral API Key**: Store your Mistral API key in the environment variable `MistralAPIKey`
   - On Replit: Add it to Secrets as `MistralAPIKey`
   - Locally: Export it before running: `export MistralAPIKey=your_api_key`

2. **Run the server**:
   ```bash
   node server.js
   ```
   The app will be available at `http://localhost:5000`

## How to Use

1. Select a food or drink image from the gallery
2. Type a question in the input field (e.g., "What ingredients are in this?")
3. Click "Analyze with Mistral AI" or press Enter
4. View the AI's answer and related food suggestions

## Project Structure

- `index.html`: Main HTML with gallery layout
- `server.js`: Node.js server with Mistral API integration
- `script.js`: Frontend JavaScript for image selection and AI calls
- `styles.css`: Styling for the gallery and AI interface
- `images/`: Food and drink images
