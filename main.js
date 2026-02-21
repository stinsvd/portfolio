console.log('Portfolio initialized');

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for scroll animations (Reveals)
const revealObserverOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once observed and animated, we can stop observing
            // revealObserver.unobserve(entry.target); 
        }
    });
}, revealObserverOptions);

// Observe sections and animated elements
document.querySelectorAll('section, .fade-in, .portfolio-item').forEach(el => {
    revealObserver.observe(el);
});

// Video Auto-play on Scroll (Disabled by user request)
/*
const videoObserverOptions = {
    threshold: 0.6
};

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            video.play().catch(error => {
                console.log("Auto-play prevented:", error);
            });
        } else {
            video.pause();
        }
    });
}, videoObserverOptions);
*/

// Video Management (Ensure only one audio source at a time)
function stopAllVideos(except = null) {
    // Mute all local videos
    document.querySelectorAll('.portfolio-video').forEach(video => {
        if (video !== except) {
            video.muted = true;
        }
    });

    // Pause all YouTube iframes (requires enablejsapi=1)
    document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe !== except) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    });
}

document.querySelectorAll('.portfolio-video').forEach(video => {
    // videoObserver.observe(video); // Disabled

    // Play on hover (Disabled by user request)
    /*
    video.parentElement.addEventListener('mouseenter', () => {
        video.play().catch(() => { });
    });
    */

    // Unmute on click and stop others
    video.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent container click from triggering
        const item = video.closest('.shorts-item');
        if (item) {
            const btn = item.querySelector('.btn-view-short');
            if (btn) btn.click();
        }
    });
});

// Handle YouTube Container Clicks (Simplified detection)
document.querySelectorAll('.portfolio-item.horizontal').forEach(card => {
    card.addEventListener('click', () => {
        const iframe = card.querySelector('iframe');
        if (iframe) {
            // Assume the user wants to play this YouTube video
            stopAllVideos(iframe);
        }
    });
});

// Mobile Nav Toggle
const navToggle = document.querySelector('.mobile-nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('mobile-nav-active');
    });
}

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        document.body.classList.remove('mobile-nav-active');
    });
});

// Toggle Portfolio Wrapper (Peek Effect)
const toggleBtn = document.getElementById('toggle-portfolio');
const wrapper = document.querySelector('.portfolio-wrapper');

if (toggleBtn && wrapper) {
    toggleBtn.addEventListener('click', () => {
        wrapper.classList.toggle('is-expanded');
    });
}

// Video Modal Logic
const modal = document.getElementById('video-modal');
const modalPlayer = document.getElementById('modal-player');
const modalClose = modal.querySelector('.modal-close');
const modalOverlay = modal.querySelector('.modal-overlay');
const playPauseBtn = document.getElementById('modal-play-pause');
const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const progressContainer = modal.querySelector('.progress-container');
const progressFilled = modal.querySelector('.progress-filled');

const modalLoader = document.getElementById('modal-loader');

function openModal(videoSrc) {
    stopAllVideos();
    modalLoader.classList.add('active'); // Show loader
    modalPlayer.src = videoSrc;
    modalPlayer.load();
    modal.classList.add('active');

    // Auto-play when ready
    modalPlayer.play();
    updatePlayPauseIcons(true);
}

// Modal Loading Logic
modalPlayer.addEventListener('waiting', () => {
    modalLoader.classList.add('active');
});

modalPlayer.addEventListener('canplay', () => {
    modalLoader.classList.remove('active');
});

modalPlayer.addEventListener('playing', () => {
    modalLoader.classList.remove('active');
});

function closeModal() {
    modal.classList.remove('active');
    modalPlayer.pause();
    modalPlayer.src = '';
}

function updatePlayPauseIcons(isPlaying) {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Open modal on "Посмотреть" click or card click
document.querySelectorAll('.shorts-item').forEach(item => {
    const btn = item.querySelector('.btn-view-short');

    // Clicking the entire card opens the modal
    item.addEventListener('click', (e) => {
        // Don't trigger if we clicked the direct link button (it will call btn click anyway)
        if (e.target.closest('.btn-view-short')) return;

        e.preventDefault();
        if (btn) {
            const videoSrc = btn.getAttribute('href');
            openModal(videoSrc);
        }
    });

    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const videoSrc = btn.getAttribute('href');
            openModal(videoSrc);
        });
    }
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Custom Controls
playPauseBtn.addEventListener('click', () => {
    if (modalPlayer.paused) {
        modalPlayer.play();
        updatePlayPauseIcons(true);
    } else {
        modalPlayer.pause();
        updatePlayPauseIcons(false);
    }
});

modalPlayer.addEventListener('timeupdate', () => {
    const percent = (modalPlayer.currentTime / modalPlayer.duration) * 100;
    if (progressFilled) progressFilled.style.width = `${percent}%`;
});

progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.pageX - rect.left) / rect.width;
    modalPlayer.currentTime = pos * modalPlayer.duration;
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});
