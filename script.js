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
        const img = document.querySelector('.card.selected img');
        const imageUrl = img.src;
        const imageExt = imageUrl.split('.').pop().split('?')[0].toLowerCase();

        const mimeType = imageExt === 'jpg' || imageExt === 'jpeg' ? 'image/jpeg' :
                        imageExt === 'png' ? 'image/png' :
                        imageExt === 'webp' ? 'image/webp' :
                        imageExt === 'avif' ? 'image/avif' : 'image/jpeg';

        const imageData = await fetchImageAsBase64(imageUrl);

        const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                imageData,
                mimeType
            })
        });

        const data = await apiResponse.json();

        if (apiResponse.ok && data.answer) {
            response.textContent = data.answer;
            status.textContent = 'Analysis complete!';
        } else {
            response.textContent = `API Error: ${data.error || 'The analysis request failed.'}`;
            status.textContent = 'Error';
        }
    } catch (error) {
        console.error('Error:', error);
        response.textContent = `Error: ${error.message}`;
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

document.getElementById('ai-question').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeWithGrok();
    }
});
