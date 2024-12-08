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
    