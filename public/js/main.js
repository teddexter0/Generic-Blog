// Code mainly for automatic image and dot sliders
let currentIndex = 0; // Active image index
        let totalSlides = 4;  // Total number of slides
        
        // Show or hide text based on the active image index
        function showText() {
            // Hide all text containers
            document.querySelectorAll('.text').forEach(text => text.style.opacity = '0');
        
            // Show the corresponding text for the active slide
            const activeText = document.querySelector(`#content${currentIndex + 1} .text`);
            if (activeText) activeText.style.opacity = '1';
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
            document.querySelectorAll('.image_container').forEach(container => {
                container.classList.remove('active');
            });
        
            // Show the active image container
            const activeContainer = document.getElementById(`content${currentIndex + 1}`);
            if (activeContainer) activeContainer.classList.add('active');
        
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
            document.querySelectorAll('.dot').forEach((dot, index) => {
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
        document.querySelectorAll('.image_container').forEach(container => {
            const overlay = container.querySelector('.overlay');
            const text = container.querySelector('.text');
        
            container.addEventListener('mouseenter', () => {
                overlay.style.width = '85%'; // Slide overlay to full width
                text.style.opacity = '1';    // Show the text
            });
        
            container.addEventListener('mouseleave', () => {
                overlay.style.width = '0'; // Hide overlay
                text.style.opacity = '0';  // Hide the text
            });
        });        

    //subscribe button confetti
document.addEventListener('DOMContentLoaded', function () {
            // Select the button with id 'sub'
            const button = document.getElementById('sub');
            
            // Check if the button exists
            if (!button) {
              console.error("Button with id 'sub' not found.");
              return; // Stop execution if the button is missing
            }
          
            // Add click event listener to the button
            button.addEventListener('click', function () {
              function random(max) {
                return Math.random() * max; // Generate a random number up to 'max'
              }
          
              const fragment = document.createDocumentFragment(); // Use a fragment for better performance
          
              for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                
                // Style the confetti directly with inline styles
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = `hsl(${random(360)}, 100%, 50%)`;
                confetti.style.left = `${button.offsetLeft + random(200) - 50}px`; // Randomize around the button
                confetti.style.top = `${button.offsetTop + random(100) - 25}px`;
                confetti.style.opacity = '1';
                confetti.style.transition = 'transform 2s ease-out, opacity 2s ease-out';
          
                // Append to fragment
                fragment.appendChild(confetti);
          
                // Animate the confetti
                setTimeout(() => {
                  confetti.style.transform = `translateY(${random(300) + 100}px)`;
                  confetti.style.opacity = '0';
    }, 10);
          
    // Remove confetti after the animation ends
    setTimeout(() => confetti.remove(), 1000);
    }
          
    // Append the fragment to the body
     document.body.appendChild(fragment);
});
});
          

const openButton = document.getElementById('open-sidebar-navbar');
const navbar = document.getElementById('navbar');

const media = window.matchMedia("(width < 700px)");

media.addEventListener('change', (e) => updateNavbar(e));

function updateNavbar(e) {
    const isMobile = e.matches // if its true we are on a mobile device, it is true, else...it is false
    conosle.log(isMobile);
    if (isMobile) {
        navbar.setAttribute('inert', '');
    } else {
        //desktop device
        navbar.removeAttribute('inert');
    }
}

function openSidebar(){
navbar.classList.add('show')
openButton.setAttribute('aria-expanded', 'true')
navbar.removeAttribute('inert')
}

function closeSidebar() {
navbar.classList.remove('show')
openButton.setAttribute('aria-expanded', 'false')
navbar.setAttribute('inert', '')
}

const navLinks = document.querySelectorAll('nav a')
navLinks.forEach(link => {
link.addEventListener('click', () => {
    closeSidebar();
}) 
})

updateNavbar(media);
