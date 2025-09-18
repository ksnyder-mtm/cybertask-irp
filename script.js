// Slide navigation functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Initialize the presentation
document.addEventListener('DOMContentLoaded', function() {
    updateSlideDisplay();
    updateProgressBar();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowRight':
            case ' ': // Spacebar
                event.preventDefault();
                changeSlide(1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                changeSlide(-1);
                break;
            case 'Home':
                event.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                event.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'Escape':
                event.preventDefault();
                toggleFullscreen();
                break;
        }
    });
    
    // Touch/swipe support for mobile
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(event) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(event) {
        if (!startX || !startY) {
            return;
        }
        
        let endX = event.changedTouches[0].clientX;
        let endY = event.changedTouches[0].clientY;
        
        let diffX = startX - endX;
        let diffY = startY - endY;
        
        // Only trigger if horizontal swipe is greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swiped left - go to next slide
                    changeSlide(1);
                } else {
                    // Swiped right - go to previous slide
                    changeSlide(-1);
                }
            }
        }
        
        startX = 0;
        startY = 0;
    });
});

// Change slide function
function changeSlide(direction) {
    const newSlide = currentSlide + direction;
    
    if (newSlide >= 0 && newSlide < totalSlides) {
        currentSlide = newSlide;
        updateSlideDisplay();
        updateProgressBar();
        updateNavigationButtons();
    }
}

// Go to specific slide
function goToSlide(slideNumber) {
    if (slideNumber >= 0 && slideNumber < totalSlides) {
        currentSlide = slideNumber;
        updateSlideDisplay();
        updateProgressBar();
        updateNavigationButtons();
    }
}

// Update slide display
function updateSlideDisplay() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Update slide counter
    const slideCounter = document.getElementById('slideCounter');
    if (slideCounter) {
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentSlide === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Auto-advance slides (optional - can be enabled for kiosk mode)
function startAutoAdvance(intervalSeconds = 30) {
    return setInterval(() => {
        if (currentSlide < totalSlides - 1) {
            changeSlide(1);
        } else {
            // Loop back to beginning or stop
            goToSlide(0);
        }
    }, intervalSeconds * 1000);
}

// Presentation timer
let presentationStartTime = null;
let timerInterval = null;

function startPresentationTimer() {
    presentationStartTime = Date.now();
    
    // Create timer display if it doesn't exist
    if (!document.getElementById('presentationTimer')) {
        const timerDiv = document.createElement('div');
        timerDiv.id = 'presentationTimer';
        timerDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1001;
        `;
        document.body.appendChild(timerDiv);
    }
    
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!presentationStartTime) return;
    
    const elapsed = Math.floor((Date.now() - presentationStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timerDisplay = document.getElementById('presentationTimer');
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color as we approach 20 minutes
        if (minutes >= 18) {
            timerDisplay.style.background = 'rgba(231, 76, 60, 0.9)';
        } else if (minutes >= 15) {
            timerDisplay.style.background = 'rgba(243, 156, 18, 0.9)';
        }
    }
}

function stopPresentationTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const timerDisplay = document.getElementById('presentationTimer');
    if (timerDisplay) {
        timerDisplay.remove();
    }
    
    presentationStartTime = null;
}

// Initialize navigation buttons on load
window.addEventListener('load', function() {
    updateNavigationButtons();
    
    // Add click handlers for presenter mode (double-click to start timer)
    document.addEventListener('dblclick', function(event) {
        if (event.ctrlKey || event.metaKey) {
            if (presentationStartTime) {
                stopPresentationTimer();
            } else {
                startPresentationTimer();
            }
        }
    });
});

// Presenter notes functionality (for presenter view)
const presenterNotes = {
    1: "Welcome everyone. Introduce yourself and the Westchester County Cybersecurity Task Force. Set expectations for the presentation.",
    2: "Review the agenda. Ask if anyone has specific questions they'd like addressed.",
    3: "Define incident response in simple terms. Emphasize it's like having a fire drill for cyber attacks.",
    4: "Share these sobering statistics. Let them sink in. Ask if anyone has experienced a cyber incident.",
    5: "Break down the real costs beyond just ransom payments. Emphasize the long-term impact.",
    6: "Walk through each step. Emphasize that even small businesses need a plan, even if it's simple.",
    7: "This is the heart of prevention. Emphasize these four areas will prevent most attacks.",
    8: "Deep dive on MFA. Show how simple it is to set up. Consider a quick demo if possible.",
    9: "Explain cyber insurance as a business necessity, not a luxury. Compare to other business insurance.",
    10: "Define roles clearly. Emphasize that in small businesses, one person may wear multiple hats.",
    11: "Stress the importance of having contacts ready BEFORE an incident occurs.",
    12: "Walk through the immediate response. Emphasize staying calm and following the plan.",
    13: "Explain why testing is crucial. A plan that's never tested is just wishful thinking.",
    14: "Give them concrete, actionable items they can start today. Make it feel manageable.",
    15: "Provide resources they can access. Emphasize local support available.",
    16: "Open for questions. Thank them for their time and attention."
};

// Function to show presenter notes (Ctrl/Cmd + N)
function showPresenterNotes() {
    const note = presenterNotes[currentSlide + 1];
    if (note) {
        alert(`Slide ${currentSlide + 1} Notes:\n\n${note}`);
    }
}

// Add presenter notes shortcut
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showPresenterNotes();
    }
});

// Add slide overview mode (Ctrl/Cmd + O)
function showSlideOverview() {
    // This could be enhanced to show thumbnails of all slides
    const slideList = Array.from(slides).map((slide, index) => {
        const title = slide.querySelector('h1')?.textContent || `Slide ${index + 1}`;
        return `${index + 1}. ${title}`;
    }).join('\n');
    
    const selectedSlide = prompt(`Slide Overview:\n\n${slideList}\n\nEnter slide number to jump to:`);
    
    if (selectedSlide) {
        const slideNumber = parseInt(selectedSlide) - 1;
        if (slideNumber >= 0 && slideNumber < totalSlides) {
            goToSlide(slideNumber);
        }
    }
}

// Add overview shortcut
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        showSlideOverview();
    }
});

// Disable context menu and text selection for presentation mode
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

document.addEventListener('selectstart', function(event) {
    event.preventDefault();
});