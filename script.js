const photos = [
    { title: "Nature", image: "https://picsum.photos/seed/nature/600/400" },
    { title: "Mountain", image: "https://picsum.photos/seed/mountain/600/400" },
    { title: "Ocean", image: "https://picsum.photos/seed/ocean/600/400" },
    { title: "Forest", image: "https://picsum.photos/seed/forest/600/400" },
    { title: "Sunset", image: "https://picsum.photos/seed/sunset/600/400" },
    { title: "Wildlife", image: "https://picsum.photos/seed/wildlife/600/400" },
    { title: "Landscape", image: "https://picsum.photos/seed/landscape/600/400" },
    { title: "Adventure", image: "https://picsum.photos/seed/adventure/600/400" },
    { title: "Travel", image: "https://picsum.photos/seed/travel/600/400" },
];

const gallery = document.querySelector("#gallery");

photos.forEach(({ title, image }) => {
    const card = document.createElement("article");
    card.className = "card";

    const photo = document.createElement("img");
    photo.src = image;
    photo.alt = title;
    photo.loading = "lazy";

    const caption = document.createElement("div");
    caption.className = "card-title";
    caption.textContent = title;

    card.append(photo, caption);
    gallery.append(card);
});