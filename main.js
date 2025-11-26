(function () {
  'use strict';

  // =========================
  // Shared Variables & Helpers
  // =========================
  var warpVeil = document.querySelector('.warp-veil');
  var body = document.body;

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
  // The Warp Transition (Agile & Mystical)
  // =========================
  function performWarpTransition(callback) {
    if (!warpVeil || prefersReducedMotion()) {
      if (callback) callback();
      return;
    }

    var baseTransform = 'translate(-50%, -50%)';

    // 1. Reset
    warpVeil.style.transition = 'none';
    warpVeil.style.opacity = '1';
    warpVeil.style.transform = baseTransform + ' scale(0)';
    void warpVeil.offsetWidth; // Força reflow

    // 2. Animate In (Fechar o véu)
    // Reduzi de 1.2s para 0.8s (rápido o suficiente para não entediar, lento para ser místico)
    warpVeil.style.transition = 'transform 0.6s cubic-bezier(0.7, 0, 0.3, 1)';
    warpVeil.style.transform = baseTransform + ' scale(1)';

    // 3. Troca de Conteúdo (Ponto Cego)
    // Acontece aos 400ms (metade exata da animação de entrada)
    setTimeout(function () {
      if (callback) callback();
    }, 400); 

    // 4. Animate Out (Abrir o véu)
    // Começa aos 800ms (assim que termina de fechar, sem pausa extra no escuro)
    setTimeout(function () {
      warpVeil.style.transform = baseTransform + ' scale(0)';
      
      // Opcional: Fade out rápido no fim para garantir que suma
      setTimeout(function() { warpVeil.style.opacity = '0'; }, 600); 
    }, 850); // Pequena margem de segurança (50ms) para garantir que a tela cobriu tudo
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

  function showView(targetId) {
    if (!targetId) return;
    // Permitir re-clicar no portal para resetar a view se necessário
    
    var target;
    if (targetId === 'portal' || targetId === '#portal') {
      targetId = 'portal';
      target = portal;
    } else {
      var id = targetId.charAt(0) === '#' ? targetId.slice(1) : targetId;
      target = document.getElementById(id);
    }
    if (!target) return;

    // Remove active class from all
    views.forEach(function (v) {
      v.classList.remove('active-view');
    });

    // Add to target
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

    // Initial State
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

      function handleCardClick(evt) {
        if (evt) {
          if (evt.type === 'keydown' && !(evt.key === 'Enter' || evt.key === ' ')) return;
          evt.preventDefault();
        }

        // 1. Run Card Ritual Animation
        var ritualClass = null;
        if (arcana === 'magician') ritualClass = 'magician-ritual';
        if (arcana === 'chariot') ritualClass = 'chariot-ritual';
        if (arcana === 'hanged') ritualClass = 'hanged-ritual';

        if (ritualClass && !prefersReducedMotion()) {
           // Remove any stuck classes
           cards.forEach(c => c.classList.remove('magician-ritual', 'chariot-ritual', 'hanged-ritual'));
           
           card.classList.add(ritualClass);
           
           // Wait for Ritual (600ms) then Warp
           setTimeout(function() {
             card.classList.remove(ritualClass);
             
             // 2. Trigger Warp & Switch View
             performWarpTransition(function() {
                showView(targetId);
             });
             
           }, 600); // Synced with CSS animation duration
        } else {
           // No animation fallback
           performWarpTransition(function() {
              showView(targetId);
           });
        }
      }

      card.addEventListener('click', handleCardClick);
      card.addEventListener('keydown', handleCardClick);
    });

    if (backBtn) {
      backBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        // Warp back to portal
        performWarpTransition(function() {
           showView('portal');
        });
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

    var currentMode = 'stage';

    function showOracleNote() {
      // Create note
      var note = document.createElement('div');
      note.className = 'oracle-enter-note';
      note.textContent = 'The veil lifts.';
      document.body.appendChild(note);
      
      // Force reflow
      void note.offsetWidth; 

      // Remove after animation
      setTimeout(function () {
        if (note && note.parentNode) {
          note.parentNode.removeChild(note);
        }
      }, 3500);
    }

    function applyMode(mode, opts) {
      opts = opts || {};
      if (currentMode === mode && !opts.force) return;
      currentMode = mode;

      buttons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-mode') === mode);
      });

      if (mode === 'oracle') {
        body.classList.add('mode-oracle');
        if (!opts.skipNote) showOracleNote();
      } else {
        body.classList.remove('mode-oracle');
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode') || 'stage';
        if (mode === currentMode) return;
        
        // Use the shared Warp Transition
        performWarpTransition(function() {
          applyMode(mode);
        });
      });
    });

    // Initial setup
    applyMode('stage', { skipNote: true, force: true });
  }

  // =========================
  // Scroll Progress
  // =========================

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
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
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal-on-scroll'));

    if (!els.length) {
      els = Array.prototype.slice.call(document.querySelectorAll('main > section'));
      els.forEach(function (el) { el.classList.add('reveal-on-scroll'); });
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
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

    els.forEach(function (el) { observer.observe(el); });
  }

  // =========================
  // Mini Nav & Active State
  // =========================

  function initMiniNav() {
    var navs = Array.prototype.slice.call(document.querySelectorAll('.mini-nav'));
    if (!navs.length) return;
    
    // Style logic moved to CSS usually, but keeping JS layout logic if needed
    navs.forEach(function (nav) {
       // Optional: Ensure JS positioning if CSS isn't sticky enough
    });

    var allButtons = Array.prototype.slice.call(document.querySelectorAll('.mini-nav__item'));
    allButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selector = btn.getAttribute('data-scroll');
        var target = document.querySelector(selector);
        if (target) smoothScrollTo(target);
      });
    });

    if (!('IntersectionObserver' in window)) return;

    // Track active section for pills
    var sectionMap = {};
    allButtons.forEach(function (btn) {
      var selector = btn.getAttribute('data-scroll');
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

          // Clear active from this specific nav group
          mapped.buttons.forEach(function(b) {
             var parent = b.parentElement;
             var siblings = parent.querySelectorAll('.mini-nav__item');
             siblings.forEach(s => s.classList.remove('is-active'));
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
  // Scroll to top
  // =========================

  function initScrollTop() {
    var btn = document.querySelector('.scroll-top');
    if (!btn) return;

    function updateVisibility() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
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

    groups.forEach(function (g) { observer.observe(g); });
  }

// =========================
  // Mystic cursor (Oracle mode) - CORRIGIDO
  // =========================

  function initMysticCursor() {
    var halo = document.querySelector('.mystic-cursor');
    if (!halo) return;

    // Garante que comece invisível se não estiver no oracle
    if (!document.body.classList.contains('mode-oracle')) {
        halo.style.opacity = '0';
    }

    document.addEventListener('mousemove', function (e) {
      // Se não for Oracle, esconde e para
      if (!document.body.classList.contains('mode-oracle')) {
        halo.style.opacity = '0';
        return;
      }

      // Mostra o cursor
      halo.style.opacity = '1';
      
      // MUDANÇA CRÍTICA: 
      // Usamos left/top para posição, deixando o CSS cuidar do 'transform' (scale/translate)
      // Isso evita que o JS mate a animação de escala do CSS.
      halo.style.left = e.clientX + 'px';
      halo.style.top = e.clientY + 'px';
    });
  }
  // =========================
  // Glow / Spotlight
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
    });

    var xrayTargets = Array.prototype.slice.call(
      document.querySelectorAll('.xray-target')
    );
    xrayTargets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--x', e.clientX - rect.left + 'px');
        el.style.setProperty('--y', e.clientY - rect.top + 'px');
      });
    });
  }

  // =========================
  // Tarot deck (Footer)
  // =========================

  function initTarotDeck() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.tarot-deck .tarot-card'));
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      function flip(evt) {
        if (evt) {
           if (evt.type === 'keydown' && !(evt.key === 'Enter' || evt.key === ' ')) return;
           evt.preventDefault();
        }
        var isFlipped = card.classList.contains('is-flipped');
        // Reset others
        cards.forEach(c => c.classList.remove('is-flipped'));
        if (!isFlipped) card.classList.add('is-flipped');
      }
      card.addEventListener('click', flip);
      card.addEventListener('keydown', flip);
    });
  }

  // =========================
  // Init
  // =========================

  document.addEventListener('DOMContentLoaded', function () {
    initRouter();
    initModeToggle();
    initScrollProgress();
    initRevealOnScroll();
    initMiniNav();
    initScrollTop();
    initMetricsObserver();
    initTarotDeck();
    initMysticCursor();
    initGlowSpotlights();
  });
})();