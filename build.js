#!/usr/bin/env node
/**
 * Martech Consulting — Blog Builder
 * 
 * Takes Airtable markdown output from /_posts/*.md
 * and generates full HTML pages into /blog/
 * 
 * Run: node build.js
 * Deps: npm install marked gray-matter
 */

const fs   = require('fs');
const path = require('path');
const { marked }   = require('marked');
const matter = require('gray-matter');

const POSTS_DIR  = path.join(__dirname, '_posts');
const OUTPUT_DIR = path.join(__dirname, 'blog');
const BLOG_INDEX = path.join(__dirname, 'blog.html');

// ── Ensure output dir exists ──────────────────────────────────────────────────
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Read all .md posts ────────────────────────────────────────────────────────
const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

const posts = postFiles.map(file => {
  const raw     = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  const { data, content } = matter(raw);

  // Strip any <script> blocks from content before converting
  // (schema JSON is already in frontmatter — we handle it in template)
  const cleanContent = content.replace(/<script[\s\S]*?<\/script>/gi, '').trim();

  // Convert markdown to HTML
  const bodyHtml = marked.parse(cleanContent);

  // Estimate read time (avg 200 wpm)
  const wordCount = cleanContent.split(/\s+/).length;
  const readTime  = Math.max(1, Math.round(wordCount / 200));

  // Author initials for avatar
  const authorName = data.author || 'Martech Consulting';
  const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Author display — map known authors
  const authorMap = {
    'Keith Phillips':          { initials: 'KP', role: 'Co-Founder & CMO · Keap Certified Partner' },
    'Jonathan Noury-Elliard':  { initials: 'JN', role: 'Co-Founder · Strategy & Technology' },
    'Martech Consulting':      { initials: 'MC', role: 'Martech Consulting' },
  };
  const authorInfo = authorMap[authorName] || { initials, role: authorName };

  return { ...data, bodyHtml, readTime, authorInfo, file };
});

// Sort by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// ── Generate each post page ───────────────────────────────────────────────────
posts.forEach(post => {
  const slug     = post.slug || post.file.replace('.md', '');
  const outFile  = path.join(OUTPUT_DIR, `${slug}.html`);
  const html     = buildPostPage(post, slug);
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`✓ blog/${slug}.html`);
});

// ── Update blog index card list ───────────────────────────────────────────────
updateBlogIndex(posts);

// ── Update sitemap ────────────────────────────────────────────────────────────
updateSitemap(posts);

console.log(`\n✅ Built ${posts.length} post(s). Blog index and sitemap updated.`);


// ═════════════════════════════════════════════════════════════════════════════
// TEMPLATE: individual post page
// ═════════════════════════════════════════════════════════════════════════════
function buildPostPage(post, slug) {
  const {
    title, date, category, tags = [], excerpt, meta_description,
    og_title, og_description, canonical_url, twitter_card,
    bodyHtml, readTime, authorInfo, author
  } = post;

  const displayDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": meta_description || excerpt,
    "author": {
      "@type": "Person",
      "name": author,
      "worksFor": { "@type": "Organization", "name": "Martech Consulting", "url": "https://martechconsulting.io" }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Martech Consulting",
      "url": "https://martechconsulting.io",
      "logo": { "@type": "ImageObject", "url": "https://martechconsulting.io/logo.svg" }
    },
    "datePublished": date,
    "dateModified": date,
    "url": canonical_url || `https://martechconsulting.io/blog/${slug}.html`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical_url || `https://martechconsulting.io/blog/${slug}.html` },
    "articleSection": category,
    "keywords": tags,
    "inLanguage": "en-US"
  }, null, 2);

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martechconsulting.io/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://martechconsulting.io/blog.html" },
      { "@type": "ListItem", "position": 3, "name": title, "item": canonical_url || `https://martechconsulting.io/blog/${slug}.html` }
    ]
  }, null, 2);

  const tagPills = tags.map(t =>
    `<span style="display:inline-flex;align-items:center;font-family:var(--ff-head);font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mid);background:var(--off);border:1px solid var(--rule);padding:.25rem .7rem;border-radius:99px;">${t}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>${title} | Martech Consulting</title>
  <meta name="description" content="${meta_description || excerpt}"/>
  <meta name="author" content="${author}"/>
  <link rel="canonical" href="${canonical_url || `https://martechconsulting.io/blog/${slug}.html`}"/>

  <meta property="og:type" content="article"/>
  <meta property="og:title" content="${og_title || title}"/>
  <meta property="og:description" content="${og_description || excerpt}"/>
  <meta property="og:url" content="${canonical_url || `https://martechconsulting.io/blog/${slug}.html`}"/>
  <meta property="og:site_name" content="Martech Consulting"/>
  <meta property="article:published_time" content="${date}"/>
  <meta property="article:author" content="${author}"/>
  <meta property="article:section" content="${category}"/>
  ${tags.map(t => `<meta property="article:tag" content="${t}"/>`).join('\n  ')}

  <meta name="twitter:card" content="${twitter_card || 'summary_large_image'}"/>
  <meta name="twitter:title" content="${og_title || title}"/>
  <meta name="twitter:description" content="${og_description || excerpt}"/>

  <script type="application/ld+json">${schemaJson}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>

  <link rel="stylesheet" href="../../style.css"/>
  <style>
    .post-hero{background:var(--navy);padding:5rem 0 3.5rem;position:relative;overflow:hidden;}
    .post-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(254,105,48,.13) 0%,transparent 70%);pointer-events:none;}
    .post-meta{display:flex;align-items:center;flex-wrap:wrap;gap:.75rem 1.5rem;margin-bottom:1.5rem;}
    .post-meta__cat{display:inline-flex;align-items:center;font-family:var(--ff-head);font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--orange);background:rgba(254,105,48,.12);border:1px solid rgba(254,105,48,.25);padding:.3rem .75rem;border-radius:99px;}
    .post-meta__date,.post-meta__read{font-size:.82rem;color:rgba(255,255,255,.45);}
    .post-hero h1{font-size:clamp(1.7rem,3.5vw,2.8rem);color:#fff;line-height:1.22;max-width:820px;margin-bottom:1.25rem;}
    .post-hero__sub{font-size:1.05rem;color:rgba(255,255,255,.65);max-width:640px;line-height:1.7;margin-bottom:2rem;}
    .post-hero__author{display:flex;align-items:center;gap:.85rem;}
    .post-hero__author-avatar{width:2.6rem;height:2.6rem;border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-family:var(--ff-head);font-size:.85rem;font-weight:700;color:#fff;flex-shrink:0;}
    .post-hero__author-name{font-family:var(--ff-head);font-size:.9rem;font-weight:500;color:#fff;}
    .post-hero__author-role{font-size:.78rem;color:rgba(255,255,255,.45);}
    .post-layout{display:grid;grid-template-columns:1fr 300px;gap:4rem;align-items:start;padding:3.5rem 0 1rem;}
    @media(max-width:860px){.post-layout{grid-template-columns:1fr;gap:2.5rem;}.post-sidebar{order:-1;}}
    .post-content h2{font-family:var(--ff-head);font-size:clamp(1.25rem,2vw,1.55rem);font-weight:500;color:var(--ink);margin:2.5rem 0 .85rem;line-height:1.3;}
    .post-content h3{font-family:var(--ff-head);font-size:1.05rem;font-weight:600;color:var(--ink);margin:1.75rem 0 .6rem;}
    .post-content p{font-size:.96rem;color:var(--mid);line-height:1.8;margin-bottom:1.25rem;}
    .post-content p:first-of-type{font-size:1.05rem;color:var(--ink);}
    .post-content ul,.post-content ol{padding-left:1.4rem;margin-bottom:1.25rem;}
    .post-content li{font-size:.93rem;color:var(--mid);line-height:1.75;margin-bottom:.45rem;}
    .post-content a{color:var(--orange);font-weight:500;text-decoration:none;border-bottom:1px solid rgba(254,105,48,.3);transition:border-color .2s;}
    .post-content a:hover{border-color:var(--orange);}
    .post-content blockquote{border-left:3px solid var(--orange);padding:1rem 1.5rem;margin:2rem 0;background:var(--off);border-radius:0 8px 8px 0;}
    .post-content blockquote p{font-size:1.05rem;color:var(--ink);font-style:italic;margin:0;}
    .post-content strong{color:var(--ink);}
    .post-sidebar{position:sticky;top:80px;}
    .sidebar-card{background:var(--off);border:1px solid var(--rule);border-radius:10px;padding:1.5rem;margin-bottom:1.25rem;}
    .sidebar-card__label{font-family:var(--ff-head);font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem;}
    .sidebar-service-link{display:flex;align-items:center;gap:.65rem;padding:.75rem 1rem;background:#fff;border:1px solid var(--rule);border-radius:7px;text-decoration:none;margin-bottom:.6rem;transition:border-color .2s;}
    .sidebar-service-link:hover{border-color:var(--orange);}
    .sidebar-service-link__name{font-family:var(--ff-head);font-size:.85rem;font-weight:500;color:var(--ink);}
    .sidebar-service-link__tag{font-size:.75rem;color:var(--muted);}
    .post-author-box{display:flex;gap:1.5rem;align-items:flex-start;background:var(--off);border:1px solid var(--rule);border-radius:10px;padding:1.75rem;margin:3rem 0 1rem;}
    .post-author-box__avatar{width:3.5rem;height:3.5rem;border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-family:var(--ff-head);font-size:1rem;font-weight:700;color:#fff;flex-shrink:0;}
    .post-author-box__name{font-family:var(--ff-head);font-size:1rem;font-weight:600;color:var(--ink);margin-bottom:.15rem;}
    .post-author-box__role{font-size:.8rem;color:var(--muted);margin-bottom:.75rem;}
    .post-author-box__bio{font-size:.87rem;color:var(--mid);line-height:1.7;}
    @media(max-width:540px){.post-author-box{flex-direction:column;}}
  </style>
</head>
<body style="padding-top:62px;">

<header class="post-hero">
  <div class="container">
    <nav class="breadcrumb" style="margin-bottom:1.5rem;">
      <a href="../../index.html">Home</a><span>/</span>
      <a href="../../blog.html">Blog</a><span>/</span>
      ${title}
    </nav>
    <div class="post-meta">
      <span class="post-meta__cat">${category}</span>
      <span class="post-meta__date">${displayDate}</span>
      <span class="post-meta__read">${readTime} min read</span>
    </div>
    <h1>${title}</h1>
    <p class="post-hero__sub">${excerpt}</p>
    <div class="post-hero__author">
      <div class="post-hero__author-avatar">${authorInfo.initials}</div>
      <div>
        <div class="post-hero__author-name">${author}</div>
        <div class="post-hero__author-role">${authorInfo.role}</div>
      </div>
    </div>
  </div>
</header>

<main class="bg-white">
  <div class="container">
    <div class="post-layout">
      <article class="post-content">
        ${bodyHtml}

        ${tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--rule);">${tagPills}</div>` : ''}

        <div class="post-author-box">
          <div class="post-author-box__avatar">${authorInfo.initials}</div>
          <div>
            <div class="post-author-box__name">${author}</div>
            <div class="post-author-box__role">${authorInfo.role}</div>
            <p class="post-author-box__bio">Martech Consulting was founded by Jonathan Noury-Elliard and Keith Phillips — a no-code technologist and a Keap Certified Partner who grew a business 300% through COVID by pivoting to marketing automation. <a href="../../about.html">Learn more about us →</a></p>
          </div>
        </div>
      </article>

      <aside class="post-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-card__label">Related services</div>
          <a href="../../automation.html" class="sidebar-service-link">
            <div>
              <div class="sidebar-service-link__name">Marketing Automation</div>
              <div class="sidebar-service-link__tag">CRM · follow-up sequences · Keap</div>
            </div>
          </a>
          <a href="../../airtable.html" class="sidebar-service-link">
            <div>
              <div class="sidebar-service-link__name">Airtable</div>
              <div class="sidebar-service-link__tag">Custom bases · automations · interfaces</div>
            </div>
          </a>
          <a href="../../email-marketing.html" class="sidebar-service-link">
            <div>
              <div class="sidebar-service-link__name">Email Marketing</div>
              <div class="sidebar-service-link__tag">Deliverability · campaigns · sequences</div>
            </div>
          </a>
        </div>

        <div style="background:var(--navy);border-radius:10px;padding:1.5rem;">
          <div style="font-family:var(--ff-head);font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.85rem;">Want this for your business?</div>
          <p style="font-size:.85rem;color:rgba(255,255,255,.6);line-height:1.65;margin-bottom:1.25rem;">Book a free call. We'll look at your setup and tell you exactly what would move the needle — with a price before you leave.</p>
          <a href="../../contact.html" class="btn btn-primary" style="width:100%;justify-content:center;text-align:center;display:flex;">Book a free call →</a>
          <p style="font-size:.72rem;color:rgba(255,255,255,.3);text-align:center;margin-top:.75rem;">No commitment. No hard sell.</p>
        </div>
      </aside>
    </div>
  </div>
</main>

<section class="cta-band">
  <div class="container cta-band__inner">
    <h2 class="section-title cta-band__headline">Ready to put this<br>into <em>practice?</em></h2>
    <p class="cta-band__sub">Book a free call with Jonathan or Keith. We'll look at your current setup honestly and tell you what would actually help.</p>
    <div class="cta-band__btns">
      <a href="../../contact.html" class="btn btn-primary btn-lg">Book a free call →</a>
      <a href="../../packages.html" class="btn btn-ghost btn-lg">See packages &amp; pricing</a>
    </div>
    <p class="cta-band__note">No commitment. No hard sell.</p>
  </div>
</section>

<script src="../../nav.js"></script>
</body>
</html>`;
}


// ═════════════════════════════════════════════════════════════════════════════
// UPDATE blog.html — inject generated cards into the grid
// ═════════════════════════════════════════════════════════════════════════════
function updateBlogIndex(posts) {
  if (!fs.existsSync(BLOG_INDEX)) {
    console.log('⚠️  blog.html not found — skipping index update');
    return;
  }

  const categoryIcons = {
    'Automation': '⚡', 'Marketing Automation': '⚡',
    'Email Marketing': '📬', 'Email': '📬',
    'Social Media': '📣', 'Paid Social': '📣',
    'No-Code': '🗂️', 'Airtable': '🗂️',
    'CRM': '🔄', 'AI': '🤖',
  };

  const cards = posts.map((post, i) => {
    const slug  = post.slug || post.file.replace('.md', '');
    const icon  = categoryIcons[post.category] || '📝';
    const href  = `blog/${slug}.html`;
    const displayDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
    const featured = i === 0 ? ' blog-card--featured' : '';

    return `
      <!-- AUTO-GENERATED: ${slug} -->
      <a href="${href}" class="blog-card${featured} reveal">
        <div class="blog-card__thumb">
          <div class="blog-card__thumb-pattern"></div>
          <span class="blog-card__thumb-icon">${icon}</span>
          <span class="blog-card__thumb-badge">${post.category}</span>
        </div>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span class="blog-card__date">${displayDate}</span>
            <span class="blog-card__read">${post.readTime} min read</span>
          </div>
          <div class="blog-card__title">${post.title}</div>
          <p class="blog-card__excerpt">${post.excerpt}</p>
          <div class="blog-card__footer">
            <div class="blog-card__author">
              <div class="blog-card__author-avatar">${post.authorInfo.initials}</div>
              <span class="blog-card__author-name">${post.author}</span>
            </div>
            <span class="blog-card__arrow">Read article →</span>
          </div>
        </div>
      </a>`;
  }).join('\n');

  let indexHtml = fs.readFileSync(BLOG_INDEX, 'utf8');

  // Replace everything between the AUTO-GENERATED markers
  const startMarker = '<!-- AUTO-GENERATED-POSTS-START -->';
  const endMarker   = '<!-- AUTO-GENERATED-POSTS-END -->';

  if (indexHtml.includes(startMarker)) {
    indexHtml = indexHtml.replace(
      new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
      `${startMarker}\n${cards}\n      ${endMarker}`
    );
    fs.writeFileSync(BLOG_INDEX, indexHtml, 'utf8');
    console.log('✓ blog.html updated');
  } else {
    console.log('⚠️  Add <!-- AUTO-GENERATED-POSTS-START --> and <!-- AUTO-GENERATED-POSTS-END --> markers to blog.html');
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// UPDATE sitemap.xml — add new post URLs
// ═════════════════════════════════════════════════════════════════════════════
function updateSitemap(posts) {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;

  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const startMarker = '<!-- AUTO-GENERATED-POSTS-START -->';
  const endMarker   = '<!-- AUTO-GENERATED-POSTS-END -->';

  const postUrls = posts.map(post => {
    const slug = post.slug || post.file.replace('.md', '');
    return `  <url>
    <loc>https://martechconsulting.io/blog/${slug}.html</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('\n');

  if (sitemap.includes(startMarker)) {
    sitemap = sitemap.replace(
      new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
      `${startMarker}\n${postUrls}\n  ${endMarker}`
    );
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('✓ sitemap.xml updated');
  }
}
