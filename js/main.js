/**
 * KingKind — site logic
 * Renders the gallery from the Instagram feed Worker when one is
 * configured, otherwise shows a clean fallback linking to the profile.
 */
(function () {
  "use strict";

  const cfg = window.SITE_CONFIG || {};
  const ig = (cfg && cfg.instagram) || {};
  const galleryEl = document.getElementById("gallery");
  const noteEl = document.getElementById("feed-note");
  const sampleGallery = galleryEl ? galleryEl.innerHTML : "";
  const profileUrl = `https://www.instagram.com/${ig.username || "akingkind"}/`;

  // Wire up every Instagram link on the page.
  ["ig-profile-link", "gallery-ig-link", "contact-ig", "footer-ig"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = profileUrl;
  });

  // Contact details from config.
  if (cfg.email) {
    const mail = document.getElementById("contact-email");
    const cta = document.getElementById("contact-cta");
    if (mail) { mail.href = `mailto:${cfg.email}`; mail.textContent = cfg.email; }
    if (cta) cta.href = `mailto:${cfg.email}?subject=Portrait%20session%20enquiry`;
  }

  // Year in the footer.
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Gallery ----------

  function showFallback(message) {
    if (galleryEl) {
      galleryEl.innerHTML = sampleGallery;
      galleryEl.removeAttribute("aria-busy");
    }
    if (noteEl && message) noteEl.textContent = message;
  }

  function showSkeletons(count) {
    galleryEl.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const tile = document.createElement("div");
      tile.className = "gallery-tile skeleton";
      galleryEl.appendChild(tile);
    }
  }

  function renderTile(post) {
    const tile = document.createElement("a");
    tile.className = "gallery-tile";
    tile.href = post.permalink || profileUrl;
    tile.target = "_blank";
    tile.rel = "noopener";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = post.caption ? cleanCaption(post.caption).slice(0, 180) : "Portrait photograph";
    img.src = post.image;

    tile.appendChild(img);

    if (post.caption) {
      const caption = document.createElement("span");
      caption.className = "tile-caption";
      caption.textContent = cleanCaption(post.caption).slice(0, 140);
      tile.appendChild(caption);
    }
    return tile;
  }

  function cleanCaption(str) {
    return String(str).replace(/\s+/g, " ").trim();
  }

  async function loadFromInstagram() {
    if (!ig.feedUrl) {
      showFallback(
        "Preview portraits are shown until the Instagram feed is connected."
      );
      return;
    }

    const limit = Math.min(Math.max(Number(ig.photoCount) || 12, 1), 12);
    if (noteEl) noteEl.textContent = "Loading the latest portraits from Instagram…";
    showSkeletons(limit);

    try {
      // The Worker holds the access token and returns only public post details.
      const res = await fetch(ig.feedUrl);
      if (!res.ok) throw new Error(`Instagram feed error (${res.status})`);
      const data = await res.json();

      const posts = (data.posts || []).filter((p) => p.image).slice(0, limit);
      if (posts.length === 0) throw new Error("No images returned");

      const grid = document.createDocumentFragment();
      posts.forEach((post) => grid.appendChild(renderTile(post)));
      galleryEl.innerHTML = "";
      galleryEl.appendChild(grid);
      galleryEl.removeAttribute("aria-busy");
      if (noteEl) noteEl.textContent = `Showing recent portraits from @${ig.username || "akingkind"}.`;
    } catch (err) {
      console.warn("Instagram feed unavailable:", err);
      showFallback(
        "Instagram couldn’t be reached, so the preview portraits are shown instead. " +
        "Visit the profile for the latest work."
      );
    }
  }

  loadFromInstagram();
})();
