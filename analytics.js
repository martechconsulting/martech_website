/**
 * PostHog Analytics - martechconsulting.io
 * Tracks: pageviews, CTA clicks, form interactions, Pulse audit, proposal flow, newsletter
 *
 * SETUP: Replace POSTHOG_KEY below with your real key from
 * app.posthog.com → Project Settings → Project API Key
 */

(function () {
  // ─── CONFIG ────────────────────────────────────────────────────────────────
  var POSTHOG_KEY = 'phc_28wsMMZi8FhUyi0WOJkHCu0AvX4XvzFrPns75btliFS';
  var POSTHOG_HOST = 'https://us.i.posthog.com';
  // ────────────────────────────────────────────────────────────────────────────

  // ─── POSTHOG SNIPPET (from your project dashboard) ──────────────────────────
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups onFeatureFlags addFeatureFlagsHandler onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
    loaded: function (ph) {
      if (typeof window === 'undefined') return;
      ph.capture('$pageview', { url: window.location.href });
      trackCustomEvents(ph);
    }
  });
  // ────────────────────────────────────────────────────────────────────────────

  function trackCustomEvents(ph) {

    // ── 1. CTA BUTTON CLICKS ──────────────────────────────────────────────────
    // Catches all .btn links (Book a call, See packages, etc.)
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a.btn, button.btn, .pkg__cta, .service-card__link');
      if (!el) return;

      var label = el.textContent.trim().replace(/\s+/g, ' ');
      var href  = el.getAttribute('href') || '';

      ph.capture('cta_click', {
        label: label,
        destination: href,
        page: window.location.pathname
      });
    });

    // ── 2. CONTACT FORM ───────────────────────────────────────────────────────
    // Fires on the contact page form submission
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form) return;

      var page = window.location.pathname;

      if (page.includes('contact')) {
        ph.capture('contact_form_submit', { page: page });
      }
    });

    // ── 3. NEWSLETTER SIGNUP BUTTON ──────────────────────────────────────────
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-newsletter]');
      if (!el) return;
      ph.capture('newsletter_cta_click', { page: window.location.pathname });
    });

    // ── 4. PULSE AUDIT ────────────────────────────────────────────────────────
    // Tracks when the audit quiz starts (first question interaction)
    var pulseStarted = false;
    if (window.location.pathname.includes('pulse')) {
      document.addEventListener('click', function (e) {
        if (!pulseStarted) {
          var el = e.target.closest('.quiz-option, [data-pulse-step], input[type="radio"], input[type="checkbox"], .option-btn');
          if (el) {
            pulseStarted = true;
            ph.capture('pulse_audit_start');
          }
        }
      });
    }

    // ── 5. PROPOSAL FORM ─────────────────────────────────────────────────────
    // Tracks start and generation events on the proposal page
    if (window.location.pathname.includes('proposal')) {
      var proposalStarted = false;

      document.addEventListener('input', function () {
        if (!proposalStarted) {
          proposalStarted = true;
          ph.capture('proposal_form_start');
        }
      });

      document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-generate], #generate-btn, .generate-proposal-btn, button[type="submit"]');
        if (!el) return;
        ph.capture('proposal_generate_click');
      });
    }

    // ── 6. PACKAGE PAGE - INDIVIDUAL PACKAGE VIEWS ───────────────────────────
    if (window.location.pathname.includes('packages')) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var pkg = entry.target;
            var name = pkg.querySelector('.pkg__name');
            if (name) {
              ph.capture('package_viewed', { package_name: name.textContent.trim() });
              observer.unobserve(pkg); // fire once per package
            }
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.pkg').forEach(function (el) {
        observer.observe(el);
      });
    }

    // ── 7. OUTBOUND LINKS ─────────────────────────────────────────────────────
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a[href]');
      if (!el) return;
      var href = el.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes('martechconsulting.io')) {
        ph.capture('outbound_link_click', {
          url: href,
          label: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
          page: window.location.pathname
        });
      }
    });

  }

})();
