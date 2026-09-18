function selectImage(card) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}