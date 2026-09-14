let selectedImage = null;

function selectImage(card) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedImage = card.querySelector('img').src;
    document.getElementById('ai-status').textContent = `Selected: ${card.querySelector('.card-title').textContent}`;
}

async function analyzeWithGrok() {
    const question = document.getElementById('ai-question').value;
    const status = document.getElementById('ai-status');
    const response = document.getElementById('ai-response');

    if (!selectedImage) {
        status.textContent = 'Please select an image first.';
        return;
    }

    if (!question) {
        status.textContent = 'Please enter a question.';
        return;
    }

    status.textContent = 'Analyzing with Grok AI...';
    response.textContent = '';

    try {
        const apiKey = process.env.GrokAPIKey || 'YOUR_GROK_API_KEY';
        
        const imageData = await fetchImageAsBase64(selectedImage);

        const apiResponse = await fetch('https://api.grok.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-vision',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: `Analyze this image and answer: ${question}. Keep your response short and concise.` },
                            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } }
                        ]
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            response.textContent = data.choices[0].message.content;
            status.textContent = 'Analysis complete!';
        } else {
            response.textContent = 'Error: Invalid response format from Grok API.';
            status.textContent = 'Error';
        }
    } catch (error) {
        console.error('Error:', error);
        response.textContent = `Error: ${error.message}. Please check your API key and try again.`;
        status.textContent = 'Error';
    }
}

async function fetchImageAsBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

document.getElementById('ai-analyze-btn').addEventListener('click', analyzeWithGrok);

// Allow Enter key to trigger analysis
document.getElementById('ai-question').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeWithGrok();
    }
});
