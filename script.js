(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  var app = window.__app;

  if (app._initialized) {
    return;
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app._burgerInit) return;
    app._burgerInit = true;

    var toggle = document.querySelector('.c-nav__toggle');
    var menu = document.querySelector('.c-nav__menu');
    var navLinks = document.querySelectorAll('.c-nav__link');
    var body = document.body;

    if (!toggle || !menu) return;

    function isOpen() {
      return menu.classList.contains('is-open');
    }

    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen()) {
        closeMenu();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (app._scrollInit) return;
    app._scrollInit = true;

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || !target.hash) return;

      var href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.indexOf('#') === 0) {
        var targetId = href.substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          var header = document.querySelector('.l-header');
          var headerHeight = header ? header.offsetHeight : 64;
          var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initActiveMenu() {
    if (app._activeMenuInit) return;
    app._activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      link.removeAttribute('aria-current');
      link.classList.remove('active');

      var linkPath = link.getAttribute('href');
      if (!linkPath) continue;

      var normalizedLinkPath = linkPath.replace(/\/$/, '');
      var normalizedCurrentPath = currentPath.replace(/\/$/, '');

      if (normalizedLinkPath === normalizedCurrentPath ||
          (normalizedCurrentPath === '' && normalizedLinkPath === '/index.html') ||
          (normalizedCurrentPath === '/index.html' && normalizedLinkPath === '/') ||
          (normalizedCurrentPath === '/' && normalizedLinkPath === '/index.html')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initScrollSpy() {
    if (app._scrollSpyInit) return;
    app._scrollSpyInit = true;

    var sections = document.querySelectorAll('.l-section[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }

  function initCountUp() {
    if (app._countUpInit) return;
    app._countUpInit = true;

    var countElements = document.querySelectorAll('.c-countdown__value[data-count]');
    if (countElements.length === 0) return;

    function animateCount(element) {
      var target = parseInt(element.getAttribute('data-count'), 10);
      var duration = 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      function updateCount() {
        current += increment;
        if (current >= target) {
          element.textContent = target;
        } else {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCount);
        }
      }

      updateCount();
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
          entry.target.setAttribute('data-counted', 'true');
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    countElements.forEach(function(element) {
      observer.observe(element);
    });
  }

  function initScrollToTop() {
    if (app._scrollTopInit) return;
    app._scrollTopInit = true;

    var scrollTopBtn = document.getElementById('scrollToTop');
    if (!scrollTopBtn) return;

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });

    scrollTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initImages() {
    if (app._imagesInit) return;
    app._imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isCritical = img.classList.contains('c-logo__img') || 
                       img.hasAttribute('data-critical') ||
                       img.closest('.l-hero');

      if (!img.hasAttribute('loading') && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var failedImg = this;
        var placeholder = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e9ecef"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="sans-serif" font-size="18">Bild nicht verfügbar</text></svg>';
        var encodedSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(placeholder);
        failedImg.src = encodedSvg;
      });
    }
  }

  function initForms() {
    if (app._formsInit) return;
    app._formsInit = true;

    var notificationContainer = document.createElement('div');
    notificationContainer.className = 'position-fixed top-0 end-0 p-3';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);

    app.notify = function(message, type) {
      var alertClass = 'alert-info';
      if (type === 'success') alertClass = 'alert-success';
      if (type === 'error') alertClass = 'alert-danger';

      var alert = document.createElement('div');
      alert.className = 'alert ' + alertClass + ' alert-dismissible fade show';
      alert.setAttribute('role', 'alert');
      alert.innerHTML = message + '<button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Schließen">&times;</button>';

      notificationContainer.appendChild(alert);

      setTimeout(function() {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 5000);
    };

    var forms = document.querySelectorAll('form');

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var currentForm = this;
        var isValid = true;
        var errors = [];

        var nameField = currentForm.querySelector('#name, #demo-name');
        var emailField = currentForm.querySelector('#email, #demo-email');
        var phoneField = currentForm.querySelector('#phone, #demo-phone');
        var messageField = currentForm.querySelector('#message, #demo-message');
        var privacyField = currentForm.querySelector('#privacy, #demo-privacy');

        function showError(field, message) {
          isValid = false;
          errors.push(message);
          if (field) {
            var errorDiv = field.parentElement.querySelector('.c-form__error');
            if (errorDiv) {
              errorDiv.textContent = message;
              errorDiv.style.display = 'block';
            }
            field.parentElement.classList.add('has-error');
          }
        }

        function clearError(field) {
          if (field) {
            var errorDiv = field.parentElement.querySelector('.c-form__error');
            if (errorDiv) {
              errorDiv.style.display = 'none';
            }
            field.parentElement.classList.remove('has-error');
          }
        }

        if (nameField) clearError(nameField);
        if (emailField) clearError(emailField);
        if (phoneField) clearError(phoneField);
        if (messageField) clearError(messageField);

        if (nameField && nameField.hasAttribute('required')) {
          var nameValue = nameField.value.trim();
          if (nameValue === '') {
            showError(nameField, 'Bitte geben Sie Ihren Namen ein.');
          } else if (nameValue.length < 2) {
            showError(nameField, 'Name muss mindestens 2 Zeichen lang sein.');
          } else if (!/^[a-zA-ZÀ-ÿs-']{2,50}$/.test(nameValue)) {
            showError(nameField, 'Name enthält ungültige Zeichen.');
          }
        }

        if (emailField && emailField.hasAttribute('required')) {
          var emailValue = emailField.value.trim();
          if (emailValue === '') {
            showError(emailField, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
          } else if (!/^[^s@]+@[^s@]+\.[^s@]+$/.test(emailValue)) {
            showError(emailField, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          }
        }

        if (phoneField && phoneField.hasAttribute('required')) {
          var phoneValue = phoneField.value.trim();
          if (phoneValue === '') {
            showError(phoneField, 'Bitte geben Sie Ihre Telefonnummer ein.');
          } else if (!/^[\ds+\-()]{10,20}$/.test(phoneValue)) {
            showError(phoneField, 'Bitte geben Sie eine gültige Telefonnummer ein.');
          }
        }

        if (messageField && messageField.hasAttribute('required')) {
          var messageValue = messageField.value.trim();
          if (messageValue === '') {
            showError(messageField, 'Bitte geben Sie eine Nachricht ein.');
          } else if (messageValue.length < 10) {
            showError(messageField, 'Nachricht muss mindestens 10 Zeichen lang sein.');
          }
        }

        if (privacyField && privacyField.hasAttribute('required') && !privacyField.checked) {
          showError(privacyField, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
        }

        if (!isValid) {
          app.notify('Bitte korrigieren Sie die markierten Fehler.', 'error');
          return;
        }

        var submitButton = currentForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          var originalText = submitButton.textContent;
          submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

          setTimeout(function() {
            app.notify('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
            currentForm.reset();
            
            var errorDivs = currentForm.querySelectorAll('.c-form__error');
            for (var j = 0; j < errorDivs.length; j++) {
              errorDivs[j].style.display = 'none';
            }
            
            var errorGroups = currentForm.querySelectorAll('.has-error');
            for (var k = 0; k < errorGroups.length; k++) {
              errorGroups[k].classList.remove('has-error');
            }

            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1000);

            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = originalText;
            }
          }, 1500);
        }
      });
    }
  }

  function initModals() {
    if (app._modalsInit) return;
    app._modalsInit = true;

    var privacyLinks = document.querySelectorAll('a[href="privacy.html"], a[href="/privacy.html"]');
    
    privacyLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey) return;
      });
    });
  }

  function initBackdrop() {
    if (app._backdropInit) return;
    app._backdropInit = true;

    var body = document.body;
    var style = document.createElement('style');
    style.textContent = '.u-no-scroll { overflow: hidden; } .u-no-scroll::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); z-index: 999; pointer-events: auto; }';
    document.head.appendChild(style);
  }

  function initRippleEffect() {
    if (app._rippleInit) return;
    app._rippleInit = true;

    var buttons = document.querySelectorAll('.c-button, .btn');

    buttons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        var ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        var rect = button.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.pointerEvents = 'none';
        
        button.appendChild(ripple);
        
        setTimeout(function() {
          ripple.style.transition = 'transform 0.6s, opacity 0.6s';
          ripple.style.transform = 'scale(4)';
          ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    });
  }

  app.init = function() {
    if (app._initialized) return;
    app._initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initActiveMenu();
    initScrollSpy();
    initCountUp();
    initScrollToTop();
    initImages();
    initForms();
    initModals();
    initBackdrop();
    initRippleEffect();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();