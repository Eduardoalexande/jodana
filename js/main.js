(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll state ---------- */

  var header = document.getElementById('header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var navLinks = nav.querySelectorAll('a');

  function handleScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateScrollspy();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---------- Mobile navigation ---------- */

  function closeNav() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('no-scroll');
  }

  function openNav() {
    nav.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('no-scroll');
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 991 && nav.classList.contains('open')) {
      closeNav();
    }
  });

  /* ---------- Scrollspy ---------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (id) {
      linkMap[id] = link;
    }
  });

  var ticking = false;

  function updateScrollspy() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var pos = window.scrollY + header.offsetHeight + 120;
      var current = sections[0] ? sections[0].id : null;
      sections.forEach(function (section) {
        if (section.offsetTop <= pos) {
          current = section.id;
        }
      });
      navLinks.forEach(function (link) {
        link.classList.remove('active');
      });
      if (current && linkMap[current]) {
        linkMap[current].classList.add('active');
      }
      ticking = false;
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function setupReveal() {
    var groups = [
      document.querySelectorAll('.section-head'),
      document.querySelectorAll('.about-content'),
      document.querySelectorAll('.about-media'),
      document.querySelectorAll('.trust-inner'),
      document.querySelectorAll('.cta-inner'),
      document.querySelectorAll('.contacts-info'),
      document.querySelectorAll('.contacts-form'),
      document.querySelectorAll('.map-wrap')
    ];

    groups.forEach(function (list) {
      list.forEach(function (el) {
        el.classList.add('reveal');
      });
    });

    var staggered = [
      document.querySelectorAll('.service-card'),
      document.querySelectorAll('.why-card'),
      document.querySelectorAll('.indicator'),
      document.querySelectorAll('.about-points li'),
      document.querySelectorAll('.trust-items li')
    ];

    staggered.forEach(function (list) {
      list.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = Math.min(i % 4, 3) * 0.09 + 's';
      });
    });

    if (!('IntersectionObserver' in window) || prefersReduced) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('in-view');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  setupReveal();

  /* ---------- Counters ---------- */

  var counters = document.querySelectorAll('.ind-num[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  var indicators = document.querySelector('.indicators');
  if (indicators && counters.length) {
    if (!('IntersectionObserver' in window) || prefersReduced) {
      counters.forEach(function (el) {
        el.textContent = parseInt(el.getAttribute('data-count'), 10) + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            counters.forEach(animateCounter);
            counterObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });
      counterObserver.observe(indicators);
    }
  }

  /* ---------- Form validation ---------- */

  var form = document.getElementById('quoteForm');
  var success = document.getElementById('formSuccess');

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phoneRe = /^\+?[0-9 ()-]{7,20}$/;

  function setInvalid(field, invalid) {
    field.classList.toggle('invalid', invalid);
  }

  function validateField(field, test) {
    var ok = test(field.querySelector('input, select, textarea').value.trim());
    setInvalid(field, !ok);
    return ok;
  }

  function validateForm() {
    var fields = {
      nome: document.getElementById('f-nome').closest('.form-field'),
      telefone: document.getElementById('f-telefone').closest('.form-field'),
      email: document.getElementById('f-email').closest('.form-field'),
      mensagem: document.getElementById('f-mensagem').closest('.form-field')
    };

    var ok = true;
    ok = validateField(fields.nome, function (v) { return v.length >= 2; }) && ok;
    ok = validateField(fields.telefone, function (v) { return phoneRe.test(v); }) && ok;
    ok = validateField(fields.email, function (v) { return emailRe.test(v); }) && ok;
    ok = validateField(fields.mensagem, function (v) { return v.length >= 10; }) && ok;

    return ok;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) {
        var firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid textarea, .form-field.invalid select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var nome = document.getElementById('f-nome').value.trim();
      var empresa = document.getElementById('f-empresa').value.trim();
      var telefone = document.getElementById('f-telefone').value.trim();
      var email = document.getElementById('f-email').value.trim();
      var servico = document.getElementById('f-servico').value || 'Não especificado';
      var mensagem = document.getElementById('f-mensagem').value.trim();

      var body = 'Nome: ' + nome + '\n' +
        'Empresa: ' + (empresa || 'Não indicada') + '\n' +
        'Telefone: ' + telefone + '\n' +
        'E-mail: ' + email + '\n' +
        'Serviço pretendido: ' + servico + '\n\n' +
        mensagem;

      var mailto = 'mailto:financas@jodana.ao' +
        '?subject=' + encodeURIComponent('Pedido de Orçamento - ' + servico) +
        '&body=' + encodeURIComponent(body);

      form.hidden = true;
      success.hidden = false;

      window.setTimeout(function () {
        window.location.href = mailto;
      }, 600);

      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('input', function (e) {
      if (e.target.matches('input, select, textarea')) {
        var field = e.target.closest('.form-field');
        if (field && field.classList.contains('invalid')) {
          setInvalid(field, false);
        }
      }
    });
  }
})();