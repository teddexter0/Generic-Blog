// Code mainly for automatic image and dot sliders
var currentIndex = 0; // Active image index
var totalSlides = 4; // Total number of slides

// Show or hide text based on the active image index
function showText() {
  // Hide all text containers
  document
    .querySelectorAll(".text")
    .forEach((text) => (text.style.opacity = "0"));

  // Show the corresponding text for the active slide
  var activeText = document.querySelector(`#content${currentIndex + 1} .text`);
  if (activeText) activeText.style.opacity = "1";
}

// Handle next slide
function next() {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateSlider();
}

// Handle previous slide
function prev() {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateSlider();
}

// Update the slider based on currentIndex
function updateSlider() {
  // Hide all image containers
  document.querySelectorAll(".image_container").forEach((container) => {
    container.classList.remove("active");
  });

  // Show the active image container
  var activeContainer = document.getElementById(`content${currentIndex + 1}`);
  if (activeContainer) activeContainer.classList.add("active");

  // Update radio buttons
  updateDots();
  showText(); // Show the text for the active slide
}

// Handle dot click
function dot(num) {
  currentIndex = num - 1;
  updateSlider();
}

// Update active dot style
function updateDots() {
  document.querySelectorAll(".dot").forEach((dot, index) => {
    if (index === currentIndex) {
      dot.checked = true;
    } else {
      dot.checked = false;
    }
  });
}

// Automatic sliding every 7 seconds
setInterval(next, 7000);

// Initial call to show the first slide
updateSlider();

// Event listener for hover effect (overlay and text)
document.querySelectorAll(".image_container").forEach((container) => {
  var overlay = container.querySelector(".overlay");
  var text = container.querySelector(".text");

  container.addEventListener("mouseenter", () => {
    overlay.style.width = "85%"; // Slide overlay to full width
    text.style.opacity = "1"; // Show the text
  });

  container.addEventListener("mouseleave", () => {
    overlay.style.width = "0"; // Hide overlay
    text.style.opacity = "0"; // Hide the text
  });
});

var openButton = document.getElementById("open-sidebar-navbar");
var navbar = document.getElementById("navbar");

var media = window.matchMedia("(width < 700px)");

media.addEventListener("change", (e) => updateNavbar(e));

function updateNavbar(e) {
  var isMobile = e.matches; // if its true we are on a mobile device, it is true, else...it is false
  console.log(isMobile);
  if (isMobile) {
    navbar.setAttribute("inert", "");
  } else {
    //desktop device
    navbar.removeAttribute("inert");
  }
}

function openSidebar() {
  navbar.classList.add("show");
  navbar.removeAttribute("inert");
}

function closeSidebar() {
  navbar.classList.remove("show");
  navbar.setAttribute("inert", "");
}

var navLinks = document.querySelectorAll("nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeSidebar();
  });
});

updateNavbar(media);

document.addEventListener("DOMContentLoaded", () => {
  const refreshButton = document.getElementById("refresh-btn");
  let refreshTimer = 3 * 60 * 1000; // 3 minutes in milliseconds
  let timer;

  const enableButton = () => {
    refreshButton.disabled = false;
    refreshButton.innerText = "Refresh";
  };

  const startTimer = () => {
    refreshButton.disabled = true;
    refreshButton.innerText = `Wait 3 minutes...`;

    timer = setTimeout(enableButton, refreshTimer);
  };

  // Start the timer when the page loads
  startTimer();

  // Handle the refresh button click
  refreshButton.addEventListener("click", () => {
    if (!refreshButton.disabled) {
      const url = new URL(window.location.href);
      url.searchParams.set("refresh", "true");
      window.location.href = url.toString();
    }
  });

  // Restart the timer when the "Next" button is clicked
  const nextButton = document.querySelector("a[href*='page=']");
  nextButton?.addEventListener("click", startTimer);
});
