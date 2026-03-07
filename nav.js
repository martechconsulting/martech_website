/* nav.js — shared navigation + footer + utilities */
(function () {

  const page = window.location.pathname.split('/').pop() || 'index.html';

  const NAV_LINKS = [
    ['packages.html',      'Packages'],
    ['how-it-works.html',  'How It Works'],
    ['about.html',         'About'],
    ['faq.html',           'FAQ'],
  ];

  const SERVICE_LINKS = [
    ['automation.html',             'Marketing Automation'],
    ['email-marketing.html',        'Email Marketing'],
    ['social-media-marketing.html', 'Social Media Ads'],
    ['airtable.html',               'Airtable'],
    ['softr.html',                  'Softr'],
    ['bubble.html',                 'Bubble'],
  ];

  /* ── Inject Nav ─────────────────────────────────── */
  function buildNav() {
    const links = NAV_LINKS.map(([href, label]) =>
      `<a href="${href}" class="${page === href ? 'active' : ''}">${label}</a>`
    ).join('');

    return `
    <nav class="nav" id="site-nav">
      <div class="container nav__inner">
        <a href="index.html" class="nav__logo">Martech <em>Consulting</em></a>
        <div class="nav__links">${links}</div>
        <a href="contact.html" class="btn btn-primary">Book a free call</a>
      </div>
    </nav>`;
  }

  /* ── Inject Footer ──────────────────────────────── */
  function buildFooter() {
    const mainLinks = [
      ['index.html','Home'],['packages.html','Packages'],
      ['how-it-works.html','How It Works'],['about.html','About'],
      ['faq.html','FAQ'],['contact.html','Contact'],
    ].map(([href,label]) => `<li><a href="${href}">${label}</a></li>`).join('');

    const svcLinks = SERVICE_LINKS
      .map(([href,label]) => `<li><a href="${href}">${label}</a></li>`).join('');

    return `
    <footer class="footer">
      <div class="container">
        <div class="footer__inner">
          <div>
            <a href="index.html" class="footer__logo">Martech <em>Consulting</em></a>
            <p class="footer__tagline">Marketing automation and technology for small business. Dover, NH — serving businesses across the US.</p>
          </div>
          <div>
            <div class="footer__col-title">Company</div>
            <ul class="footer__links">${mainLinks}</ul>
          </div>
          <div>
            <div class="footer__col-title">Services</div>
            <ul class="footer__links">${svcLinks}</ul>
          </div>
        </div>
        <div class="footer__bottom">© 2026 Martech Consulting · martechconsulting.io · Dover, New Hampshire</div>
      </div>
    </footer>`;
  }

  /* ── Init ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    // Inject nav at top of body
    document.body.insertAdjacentHTML('afterbegin', buildNav());

    // Inject footer at bottom of body
    document.body.insertAdjacentHTML('beforeend', buildFooter());

    // Nav scroll behavior
    const nav = document.getElementById('site-nav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { obs.observe(el); });

    // FAQ accordion
    document.querySelectorAll('.faq-item__q').forEach(function (q) {
      q.addEventListener('click', function () {
        const item = this.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });

  });

})();
