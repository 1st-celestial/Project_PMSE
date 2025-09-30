(function ($) {
    "use strict";

  // Site-wide Preloader
    var sitePreloader = function () {
        const preloader = document.getElementById('preloader');
        let pageLoaded = false;
        let minTimeElapsed = false;

        // Check if page is loaded
        $(window).on('load', function() {
            pageLoaded = true;
            hidePreloader();
        });

        // Minimum display time of 1.2 seconds
        setTimeout(function() {
            minTimeElapsed = true;
            hidePreloader();
        }, 1100);

        // Function to hide preloader
        function hidePreloader() {
    if (pageLoaded && minTimeElapsed && preloader) {
        preloader.classList.add('fade-out');
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500); 
    }
}

        // Fallback: hide after 3 seconds maximum
        setTimeout(function() {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 1700);
    };

    // Initialize preloader when DOM is ready
    $(document).ready(function() {
        sitePreloader();
    });
    
  // Initiate the wowjs
new WOW().init();

    // Header carousel
    $(".header-carousel").owlCarousel({
        animateOut: 'fadeOut',
        items: 1,
        margin: 0,
        stagePadding: 0,
        autoplay: true,
        smartSpeed: 1000,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
    });


   // Service-carousel
   $(".service-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 2000,
    center: false,
    dots: false,
    loop: true,
    margin: 25,
    nav : true,
    navText : [
        '<i class="bi bi-arrow-left"></i>',
        '<i class="bi bi-arrow-right"></i>'
    ],
    responsiveClass: true,
    responsive: {
        0:{
            items:1
        },
        576:{
            items:1
        },
        768:{
            items:2
        },
        992:{
            items:2
        },
        1200:{
            items:2
        }
    }
    });


    // testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : false,
        navText : [
            '<i class="fa fa-angle-right"></i>',
            '<i class="fa fa-angle-left"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:1
            },
            992:{
                items:1
            },
            1200:{
                items:2
            }
        }
    });


   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


})(jQuery);

    // About years count up animation
        function animateYearsCount() {
            var numberSpan = document.querySelector('.about-years .main-number');
            var plusSpan = document.querySelector('.about-years .plus-sign');
            if (!numberSpan || !plusSpan) return;
            var count = 0;
            var target = 5;
            var duration = 1000;
            var stepTime = Math.max(Math.floor(duration / target), 10);
            var interval = setInterval(function() {
                count++;
                numberSpan.textContent = count;
                if (count >= target) {
                    clearInterval(interval);
                    setTimeout(function() {
                        plusSpan.classList.add('visible');
                    }, 300);
                }
            }, stepTime);
        }
        // Intersection Observer to trigger count-up when .about-years is in view
        function setupYearsCountObserver() {
            var badge = document.querySelector('.about-years');
            var numberSpan = document.querySelector('.about-years .main-number');
            var plusSpan = document.querySelector('.about-years .plus-sign');
            if (!badge || !numberSpan || !plusSpan) return;
            numberSpan.textContent = '0';
            plusSpan.classList.remove('visible');
            var hasAnimated = false;
            var observer = new window.IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting && !hasAnimated) {
                    animateYearsCount();
                    hasAnimated = true;
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            observer.observe(badge);
        }
        window.addEventListener('load', setupYearsCountObserver);
        /*services*/
(function () {
  var wrapper = document.querySelector('.car-wrapper');
  var carouselSlide = document.querySelector('.car-slide');
  var items = Array.prototype.slice.call(document.querySelectorAll('.car-item'));
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.indicator'));

  if (!carouselSlide || items.length === 0) return;

  var TOTAL = items.length;
  var visible = 1;       // number of visible items
  var itemPercent = 100; // percent width per item
  var currentIndex = 0;  // left-most visible index
  var autoTimer = null;
  var AUTO_DELAY = 3500;

  function updateVisible() {
    var w = window.innerWidth;
    if (w >= 1024) visible = 3;
    else if (w >= 768) visible = 2;
    else visible = 1;
    itemPercent = 100 / visible;
  }

  function updateCarousel(animate) {
    if (animate === void 0) animate = true;

    updateVisible();

    var maxIndex = Math.max(0, TOTAL - visible);
    if (currentIndex > maxIndex) {
      currentIndex = 0;
    }
    if (currentIndex < 0) currentIndex = 0;

    var translatePct = -(currentIndex * itemPercent);

    if (!animate) {
      carouselSlide.style.transition = 'none';
      carouselSlide.style.transform = 'translateX(' + translatePct + '%)';
      void carouselSlide.offsetWidth; // reflow
      carouselSlide.style.transition = '';
    } else {
      carouselSlide.style.transform = 'translateX(' + translatePct + '%)';
    }

    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    var maxIndex = Math.max(0, TOTAL - visible);
    if (currentIndex < maxIndex) currentIndex++;
    else currentIndex = 0;
    updateCarousel();
  }

  function prevSlide() {
    var maxIndex = Math.max(0, TOTAL - visible);
    if (currentIndex > 0) currentIndex--;
    else currentIndex = maxIndex;
    updateCarousel();
  }

  function goToIndex(i) {
    var idx = Math.max(0, Math.min(TOTAL - 1, Number(i)));
    var maxIndex = Math.max(0, TOTAL - visible);
    currentIndex = (idx > maxIndex) ? 0 : idx;
    updateCarousel();
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // === Controls ===
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      stopAuto();
      nextSlide();
      startAuto();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      stopAuto();
      prevSlide();
      startAuto();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      stopAuto();
      goToIndex(i);
      startAuto();
    });
  });

  // === Pause on hover ===
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);
  }

  // === Init ===
  window.addEventListener('resize', function () { updateCarousel(false); });
  updateVisible();
  updateCarousel(false);
  startAuto();

  // === Debug API ===
  window.pmCarousel = {
    next: nextSlide,
    prev: prevSlide,
    goTo: goToIndex,
    start: startAuto,
    stop: stopAuto
  };
})();
(function () {
  var track = document.querySelector('.brand-track');
  if (!track) return;

  // speed in pixels per second (adjust to taste)
  var SPEED_PX_PER_SEC = 60;

  // create <style> to inject dynamic keyframes
  var animStyleEl = document.createElement('style');
  document.head.appendChild(animStyleEl);

  // debounce helper
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  function setupScroll() {
    // find the first brand-set and measure its width
    var sets = track.querySelectorAll('.brand-set');
    if (!sets || sets.length < 2) {
      // if user didn't duplicate sets, fallback: duplicate programmatically
      var nodes = track.children;
      var clone = track.cloneNode(true);
      // append clones until width > container
      track.appendChild(clone);
      sets = track.querySelectorAll('.brand-set');
      if (sets.length < 2) return;
    }

    var firstSet = sets[0];
    var distance = Math.ceil(firstSet.getBoundingClientRect().width);

    if (distance === 0) return;

    // compute duration from speed (ms)
    var durationMs = Math.max(4000, Math.round((distance / SPEED_PX_PER_SEC) * 1000));

    // Update the track style (use transform animation by px)
    // We inject a keyframes rule that translates the track by -distance px
    var keyframes =
      '@keyframes scroll-left-dynamic {' +
        '0% { transform: translateX(0); }' +
        '100% { transform: translateX(-' + distance + 'px); }' +
      '}';

    // set animation on .brand-track to use our keyframes
    animStyleEl.textContent = keyframes +
      '\n.brand-track { animation: scroll-left-dynamic ' + (durationMs/1000) + 's linear infinite; }';

    // ensure track width is not wrapped (flex handles it)
    track.style.willChange = 'transform';
  }

  // init and recalc on resize (debounced)
  setupScroll();
  window.addEventListener('resize', debounce(setupScroll, 180));
})();

 // contact1 js
document.getElementById("contactForm").addEventListener("submit", function(e) {
  var isValid = true;

  // Reset errors
  var errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(function(el) {
    el.style.display = "none";
  });

  // Name
  var name = document.getElementById("name");
  if (name.value.trim() === "") {
    document.getElementById("name-error").style.display = "block";
    isValid = false;
  }

  // Email
  var email = document.getElementById("email");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    document.getElementById("email-error").style.display = "block";
    isValid = false;
  }

  // Subject
  var subject = document.getElementById("subject");
  if (subject.value === "") {
    document.getElementById("subject-error").style.display = "block";
    isValid = false;
  }

  // Message
  var message = document.getElementById("message");
  if (message.value.trim() === "") {
    document.getElementById("message-error").style.display = "block";
    isValid = false;
  }

  // Privacy
  var privacy = document.getElementById("privacy");
  if (!privacy.checked) {
    document.getElementById("privacy-error").style.display = "block";
    isValid = false;
  }

  if (!isValid) {
    e.preventDefault(); 
  }
});

