// MENU
const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const toggleIcon = toggle.querySelector('i');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');

  if (toggleIcon.classList.contains('fa-bars')) {
    toggleIcon.classList.replace('fa-bars', 'fa-times');
  } else {
    toggleIcon.classList.replace('fa-times', 'fa-bars');
  }
});

// CARROSSEL
const carousels = document.querySelectorAll('.carousel');

carousels.forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');

  next.addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' });
  });
});
