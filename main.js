(function () {
  'use strict';

  // =========================
  // Helpers
  // =========================

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function smoothScrollTo(target) {
    if (!target) return;
    var behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    try {
      target.scrollIntoView({ behavior: behavior, block: 'start' });
    } catch (e) {
      var top = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top, behavior: behavior });
    }
  }

  // =========================
  // SPA Router (Portal & Views)
  // =========================

  var state = {
    view: 'portal'
  };

  var views = [];
  var portal = null;
  var backBtn = null;
  var body = document.body;

  function showView(targetId) {
    if (!targetId) return;
    if (state.view === targetId) return;

    var target;
    if (targetId === 'portal' || targetId === '#portal') {
      targetId = 'portal';
      target = portal;
    } else {
      var id = targetId.charAt(0) === '#' ? targetId.slice(1) : targetId;
      target = document.getElementById(id);
    }
    if (!target) return;

    views.forEach(function (v) {
      v.classList.remove('active-view');
    });
    target.classList.add('active-view');
    state.view = targetId;

    if (targetId === 'portal') {
      body.classList.add('view-portal');
    } else {
      body.classList.remove('view-portal');
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function initRouter() {
    portal = document.getElementById('portal');
    backBtn = document.getElementById('back-to-portal');
    views = Array.prototype.slice.call(
      document.querySelectorAll('.portal-container, .view-section')
    );

    if (!portal) return;

    body.classList.add('view-portal');
    portal.classList.add('active-view');

    var cards = Array.prototype.slice.call(
      document.querySelectorAll('.portal-card')
    );

    cards.forEach(function (card) {
      var targetId = card.getAttribute('data-target');
      var arcana = card.getAttribute('data-arcana');
      if (!targetId) return;
      card.setAttribute('tabindex', '0');

      function runCardRitual(callback) {
        // remove rituais antigos
        cards.forEach(function (c) {
          c.classList.remove(
            'magician-ritual',
            'chariot-ritual',
            'hanged-ritual'
          );
        });

        var ritualClass = null;
        if (arcana === 'magician') ritualClass = 'magician-ritual';
        if (arcana === 'chariot') ritualClass = 'chariot-ritual';
        if (arcana === 'hanged') ritualClass = 'hanged-ritual';

        if (!ritualClass || prefersReducedMotion()) {
          if (typeof callback === 'function') callback();
          return;
        }

        card.classList.add(ritualClass);
        setTimeout(function () {
          card.classList.remove(ritualClass);
          if (typeof callback === 'function') callback();
        }, 450);
      }

      function handleActivate(evt) {
        if (evt) {
          if (
            evt.type === 'keydown' &&
            !(evt.key === 'Enter' || evt.key === ' ')
          ) {
            return;
          }
          evt.preventDefault();
        }
        runCardRitual(function () {
          showView(targetId);
        });
      }

      card.addEventListener('click', handleActivate);
      card.addEventListener('keydown', handleActivate);
    });

    if (backBtn) {
      backBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        showView('portal');
      });
    }

    window.switchView = showView;
  }

  // =========================
  // Mode Toggle (Stage / Oracle)
  // =========================

  function initModeToggle() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll('.mode-toggle__btn')
    );
    if (!buttons.length) return;

    var warpVeil = document.querySelector('.warp-veil');
    var currentMode = 'stage';

    function showOracleNote() {
      // nota rápida "The veil lifts."
      if (!document.body.classList.contains('mode-oracle')) return;

      var note = document.createElement('div');
      note.className = 'oracle-enter-note';
      note.textContent = 'The veil lifts.';
      document.body.appendChild(note);

      setTimeout(function () {
        if (note && note.parentNode) {
          note.parentNode.removeChild(note);
        }
      }, 3200);
    }

    function applyMode(mode, opts) {
      opts = opts || {};
      if (currentMode === mode) return;
      currentMode = mode;

      buttons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-mode') === mode);
      });

      if (mode === 'oracle') {
        body.classList.add('mode-oracle');
      } else {
        body.classList.remove('mode-oracle');
      }

      if (mode === 'oracle' && !opts.skipNote) {
        showOracleNote();
      }
    }

    function runWarpAndSetMode(mode) {
      if (!warpVeil || prefersReducedMotion()) {
        applyMode(mode);
        return;
      }

      var baseTransform = 'translate(-50%, -50%)';

      // reset
      warpVeil.style.transition = 'none';
      warpVeil.style.opacity = '1';
      warpVeil.style.transform = baseTransform + ' scale(0)';
      // força reflow
      void warpVeil.offsetWidth;

      warpVeil.style.transition =
        'transform 0.6s cubic-bezier(0.75, 0, 0.25, 1), opacity 0.6s ease';
      warpVeil.style.transform = baseTransform + ' scale(1)';

      // aplica modo logo no começo da animação
      setTimeout(function () {
        applyMode(mode);
      }, 120);

      // recolhe o véu
      setTimeout(function () {
        warpVeil.style.transform = baseTransform + ' scale(0)';
        warpVeil.style.opacity = '0';
      }, 420);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode') || 'stage';
        if (mode === currentMode) return;
        runWarpAndSetMode(mode);
      });
    });

    // modo inicial sem warp nem nota
    applyMode('stage', { skipNote: true });
  }

  // =========================
  // Scroll Progress
  // =========================

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    function update() {
      var scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', update);
    update();
  }

  // =========================
  // Reveal on Scroll
  // =========================

  function initRevealOnScroll() {
    var els = Array.prototype.slice.call(
      document.querySelectorAll('.reveal-on-scroll')
    );

    if (!els.length) {
      els = Array.prototype.slice.call(
        document.querySelectorAll('main > section')
      );
      els.forEach(function (el) {
        el.classList.add('reveal-on-scroll');
      });
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================
  // Mini Nav (bottom pills)
  // =========================

  function initMiniNav() {
    var navs = Array.prototype.slice.call(
      document.querySelectorAll('.mini-nav')
    );
    if (!navs.length) return;

    navs.forEach(function (nav) {
      nav.style.position = 'fixed';
      nav.style.bottom = '24px';
      nav.style.left = '50%';
      nav.style.transform = 'translateX(-50%)';
      nav.style.zIndex = '60';

      var buttons = Array.prototype.slice.call(
        nav.querySelectorAll('.mini-nav__item')
      );
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var selector =
            btn.getAttribute('data-scroll') || btn.getAttribute('data-section');
          if (!selector) return;
          var target = document.querySelector(selector);
          if (target) smoothScrollTo(target);
        });
      });
    });

    if (!('IntersectionObserver' in window)) return;

    var allButtons = Array.prototype.slice.call(
      document.querySelectorAll('.mini-nav__item')
    );
    var sectionMap = {};

    allButtons.forEach(function (btn) {
      var selector =
        btn.getAttribute('data-scroll') || btn.getAttribute('data-section');
      if (!selector) return;
      var target = document.querySelector(selector);
      if (!target || !target.id) return;
      var key = '#' + target.id;
      if (!sectionMap[key]) {
        sectionMap[key] = { section: target, buttons: [] };
      }
      sectionMap[key].buttons.push(btn);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          var mapped = sectionMap[id];
          if (!mapped) return;

          allButtons.forEach(function (b) {
            b.classList.remove('is-active');
          });
          mapped.buttons.forEach(function (b) {
            b.classList.add('is-active');
          });
        });
      },
      { threshold: 0.3 }
    );

    Object.keys(sectionMap).forEach(function (key) {
      observer.observe(sectionMap[key].section);
    });
  }

  // =========================
  // Scroll to top button
  // =========================

  function initScrollTop() {
    var btn = document.querySelector('.scroll-top');
    if (!btn) return;

    function updateVisibility() {
      var scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrollTop > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', updateVisibility);
    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });

    updateVisibility();
  }

  // =========================
  // Metrics Animation
  // =========================

  function initMetricsObserver() {
    var groups = Array.prototype.slice.call(
      document.querySelectorAll('.case-metrics, .anticase-stats')
    );
    if (!groups.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('metrics-in-view');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    groups.forEach(function (g) {
      observer.observe(g);
    });
  }

  // =========================
  // Keyboard shortcuts (1–6)
  // =========================

  function initKeyboardShortcuts() {
    var order = [
      '#hero',
      '#about',
      '#experience',
      '#how-i-work',
      '#next-role',
      '#anticase'
    ];

    document.addEventListener('keydown', function (event) {
      var activeEl = document.activeElement;
      if (
        !event ||
        !event.key ||
        (activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable))
      ) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) return;

      var num = parseInt(event.key, 10);
      if (!num || num < 1 || num > order.length) return;

      var selector = order[num - 1];
      var target = document.querySelector(selector);
      if (!target) return;

      event.preventDefault();
      smoothScrollTo(target);
    });
  }

  // =========================
  // Mystic cursor (Oracle mode)
  // =========================

  function initMysticCursor() {
    var halo = document.querySelector('.mystic-cursor');
    if (!halo) return;

    halo.style.opacity = '0';

    document.addEventListener('mousemove', function (e) {
      if (!document.body.classList.contains('mode-oracle')) {
        halo.style.opacity = '0';
        return;
      }

      var x = e.clientX - halo.offsetWidth / 2;
      var y = e.clientY - halo.offsetHeight / 2;

      halo.style.opacity = '1';
      halo.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });
  }

  // =========================
  // Glow / Spotlight (botões + xray)
  // =========================

  function initGlowSpotlights() {
    var glowTargets = Array.prototype.slice.call(
      document.querySelectorAll('.btn, .mode-toggle__btn, .mini-nav__item')
    );

    glowTargets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--x', e.clientX - rect.left + 'px');
        el.style.setProperty('--y', e.clientY - rect.top + 'px');
      });
      el.addEventListener('mouseleave', function () {
        el.style.removeProperty('--x');
        el.style.removeProperty('--y');
      });
    });

    // xray nos arcos dos cases
    var xrayTargets = Array.prototype.slice.call(
      document.querySelectorAll('.xray-target')
    );
    xrayTargets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--x', e.clientX - rect.left + 'px');
        el.style.setProperty('--y', e.clientY - rect.top + 'px');
      });
      el.addEventListener('mouseleave', function () {
        el.style.removeProperty('--x');
        el.style.removeProperty('--y');
      });
    });
  }

  // =========================
  // Tarot deck (closing cards)
  // =========================

  function initTarotDeck() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll('.tarot-card')
    );
    if (!cards.length) return;

    cards.forEach(function (card) {
      var inner = card.querySelector('.tarot-card-inner') || card;
      card.setAttribute('tabindex', '0');

      function flip(evt) {
        if (evt) {
          if (
            evt.type === 'keydown' &&
            !(evt.key === 'Enter' || evt.key === ' ')
          ) {
            return;
          }
          evt.preventDefault();
        }
        var isFlipped = card.classList.contains('is-flipped');
        cards.forEach(function (c) {
          c.classList.remove('is-flipped');
        });
        if (!isFlipped) {
          card.classList.add('is-flipped');
        }
      }

      card.addEventListener('click', flip);
      card.addEventListener('keydown', flip);
    });
  }

  // =========================
  // Init all
  // =========================

  document.addEventListener('DOMContentLoaded', function () {
    initRouter();
    initModeToggle();
    initScrollProgress();
    initRevealOnScroll();
    initMiniNav();
    initScrollTop();
    initMetricsObserver();
    initKeyboardShortcuts();
    initTarotDeck();
    initMysticCursor();
    initGlowSpotlights();
  });
})();
