let currentIndex = 0; // Current active image index
let totalSlides = 4; // Total number of images

function next() {
    // Remove "active" class from the current image
    document.querySelector(".image_container .active").classList.remove("active");

    // Update index
    currentIndex = (currentIndex + 1) % totalSlides;

    // Add "active" class to the new image
    document.getElementById("content" + (currentIndex + 1)).classList.add("active");

    // Update dots
    indicator(currentIndex + 1);
}

function prev() {
    // Remove "active" class from the current image
    document.querySelector(".image_container .active").classList.remove("active");

    // Update index
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;

    // Add "active" class to the new image
    document.getElementById("content" + (currentIndex + 1)).classList.add("active");

    // Update dots
    indicator(currentIndex + 1);
}

function dot(num) {
    // Remove "active" class from the current image
    document.querySelector(".image_container .active").classList.remove("active");

    // Update index based on dot clicked
    currentIndex = num - 1;

    // Add "active" class to the selected image
    document.getElementById("content" + num).classList.add("active");

    // Update dots
    indicator(num);
}

function indicator(num) {
    // Reset all dots
    document.querySelectorAll(".dot_container button").forEach(function (dot) {
        dot.style.backgroundColor = "transparent";
    });

    // Highlight the active dot
    document.querySelector(`.dot_container button:nth-child(${num})`).style.backgroundColor = "lime";
}

// Automatic sliding every 5 seconds
setInterval(next, 5000);

document.querySelectorAll('.image_container').forEach(container => {
    const overlay = container.querySelector('.overlay');
    const text = container.querySelector('.text');

    container.addEventListener('mouseenter', () => {
        overlay.style.width = '85%'; // Slide overlay to 75%
        text.style.opacity = '1';   // Fade in text
    });

    container.addEventListener('mouseleave', () => {
        overlay.style.width = '0'; // Hide overlay
        text.style.opacity = '0';  // Fade out text
    });
});

