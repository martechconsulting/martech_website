/**
 * PostHog Analytics - martechconsulting.io
 */

(function () {
  var POSTHOG_KEY = 'phc_28wsMMZi8FhUyi0WOJkHCu0AvX4XvzFrPns75btliFS';
  var POSTHOG_HOST = 'https://us.i.posthog.com';

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups onFeatureFlags addFeatureFlagsHandler onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
    loaded: function (ph) {
      if (typeof window === 'undefined') return;
      ph.capture('$pageview', { url: window.location.href });
      trackButtonClicks(ph);
      trackFormSubmissions(ph);
      trackScrollDepth(ph);
      trackOutboundLinks(ph);
      runHeroExperiment(ph);
      runPulseExperiment(ph);
    }
  });

  // ── 1. BUTTON CLICKS ───────────────────────────────────────────────────────
  function trackButtonClicks(ph) {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a, button, [role="button"]');
      if (!el) return;

      var tag       = el.tagName.toLowerCase();
      var text      = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 100);
      var href      = el.getAttribute('href') || '';
      var classList = el.className || '';

      if (!text) return;
      if (href && href.startsWith('http') && !href.includes('martechconsulting.io')) return;

      ph.capture('button_clicked', {
        button_text:  text,
        button_type:  tag === 'a' ? 'link' : 'button',
        button_class: classList.slice(0, 100),
        destination:  href,
        page:         window.location.pathname
      });
    });
  }

  // ── 2. FORM SUBMISSIONS ────────────────────────────────────────────────────
  function trackFormSubmissions(ph) {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form) return;

      ph.capture('form_submitted', {
        form_id:   form.id   || 'unknown',
        form_name: form.name || form.id || 'unknown',
        page:      window.location.pathname
      });
    });
  }

  // ── 3. SCROLL DEPTH ────────────────────────────────────────────────────────
  function trackScrollDepth(ph) {
    var milestones = [25, 50, 75, 100];
    var reached    = {};

    function getScrollPercent() {
      var el           = document.documentElement;
      var body         = document.body;
      var scrollTop    = el.scrollTop || body.scrollTop;
      var scrollHeight = (el.scrollHeight || body.scrollHeight) - el.clientHeight;
      if (scrollHeight <= 0) return 100;
      return Math.floor((scrollTop / scrollHeight) * 100);
    }

    window.addEventListener('scroll', function () {
      var pct = getScrollPercent();
      milestones.forEach(function (milestone) {
        if (!reached[milestone] && pct >= milestone) {
          reached[milestone] = true;
          ph.capture('scroll_depth_reached', {
            scroll_depth_percent: milestone,
            page: window.location.pathname
          });
        }
      });
    }, { passive: true });
  }

  // ── 4. OUTBOUND LINK CLICKS ────────────────────────────────────────────────
  function trackOutboundLinks(ph) {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a[href]');
      if (!el) return;
      var href = el.getAttribute('href');
      if (!href || !href.startsWith('http')) return;
      if (href.includes('martechconsulting.io')) return;

      ph.capture('outbound_link_clicked', {
        destination_url: href,
        link_text:       el.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
        page:            window.location.pathname
      });
    });
  }

  // ── 5. HOMEPAGE HERO A/B EXPERIMENT ───────────────────────────────────────
  // Control:  "Stop losing leads to silence" / "Book a free call"
  // Variant:  "Your marketing should work while you sleep" / "Get a free audit"
  function runHeroExperiment(ph) {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') return;

    ph.onFeatureFlags(function () {
      if (posthog.getFeatureFlag('hero-headline-cta-test') === 'variant') {

        var h1 = document.querySelector('.hero h1, .hero .display');
        if (h1) h1.innerHTML = 'Your marketing should<br>work while you <em>sleep.</em>';

        var cta = document.querySelector('.hero .btn-primary, .hero__ctas .btn-primary');
        if (cta) {
          var svg = cta.querySelector('svg');
          cta.childNodes.forEach(function (node) {
            if (node.nodeType === 3) node.textContent = 'Get a free audit ';
          });
          if (!cta.querySelector('svg') && svg) cta.appendChild(svg);
        }

      } else {
        // Control — default behavior, no changes.
      }

      // Conversion: primary CTA click
      // preventDefault + setTimeout so PostHog fires before navigation
      var heroCta = document.querySelector('.hero .btn-primary, .hero__ctas .btn-primary');
      if (heroCta) {
        heroCta.addEventListener('click', function (e) {
          e.preventDefault();
          var dest = heroCta.getAttribute('href') || 'contact.html';
          ph.capture('hero_cta_clicked', {
            variant:     posthog.getFeatureFlag('hero-headline-cta-test') || 'control',
            button_text: heroCta.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
            page:        window.location.pathname
          });
          setTimeout(function () { window.location.href = dest; }, 300);
        });
      }
    });
  }

  // ── 6. PULSE PAGE HERO A/B EXPERIMENT ─────────────────────────────────────
  // Control:  "Find out where your business leaks time every week" / "Get your free score"
  // Variant:  "See how many hours your business is losing every week" / "Get my free audit"
  function runPulseExperiment(ph) {
    var path = window.location.pathname;
    if (!path.includes('pulse')) return;

    ph.onFeatureFlags(function () {
      if (posthog.getFeatureFlag('pulse-hero-headline-cta-test') === 'variant') {

        var h1 = document.querySelector('.pulse-hero h1, .pulse-hero .display');
        if (h1) h1.innerHTML = 'See how many hours your business is <em>losing</em> every week';

        var cta = document.querySelector('.pulse-hero .btn-primary');
        if (cta) {
          var svg = cta.querySelector('svg');
          cta.childNodes.forEach(function (node) {
            if (node.nodeType === 3) node.textContent = 'Get my free audit ';
          });
          if (!cta.querySelector('svg') && svg) cta.appendChild(svg);
        }

      } else {
        // Control — default behavior, no changes.
      }

      // Conversion: Pulse CTA click
      // Pulse CTA calls startAudit() inline so no navigation — fires normally
      var pulseCta = document.querySelector('.pulse-hero .btn-primary');
      if (pulseCta) {
        pulseCta.addEventListener('click', function () {
          ph.capture('pulse_cta_clicked', {
            variant:     posthog.getFeatureFlag('pulse-hero-headline-cta-test') || 'control',
            button_text: pulseCta.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
            page:        window.location.pathname
          });
        });
      }
    });
  }

})();
