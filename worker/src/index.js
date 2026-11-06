/**
 * KingKind Instagram feed.
 *
 * Holds the Meta access token as a secret and gives the website only the
 * public details it needs to draw the gallery. GET /feed returns:
 *
 *   { "posts": [{ "image", "permalink", "caption", "timestamp" }] }
 */

const GRAPH_URL = "https://graph.facebook.com/v27.0";
// The site's header image, About image and 12 gallery tiles.
const MAX_POSTS = 14;
// Ask for more than we show, because videos are left out.
const FETCH_LIMIT = MAX_POSTS * 2;
const CACHE_SECONDS = 900;
const FIELDS = [
  "media_type",
  "media_url",
  "permalink",
  "caption",
  "timestamp",
  "children{media_type,media_url}",
].join(",");

/** Image to show for a post, or null for posts with no image, such as videos. */
function imageFor(post) {
  if (post.media_type === "IMAGE") return post.media_url || null;
  if (post.media_type === "CAROUSEL_ALBUM") {
    const slides = (post.children && post.children.data) || [];
    const first = slides.find((s) => s.media_type === "IMAGE" && s.media_url);
    return first ? first.media_url : null;
  }
  return null;
}

function toPublicPosts(data) {
  return (data.data || [])
    .map((post) => ({
      image: imageFor(post),
      permalink: post.permalink || null,
      caption: post.caption || "",
      timestamp: post.timestamp || null,
    }))
    .filter((post) => post.image)
    .slice(0, MAX_POSTS);
}

async function fetchPosts(env) {
  const url = new URL(`${GRAPH_URL}/${env.IG_USER_ID}/media`);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(FETCH_LIMIT));
  url.searchParams.set("access_token", env.IG_ACCESS_TOKEN);

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Log only Meta's error numbers. The request URL contains the token.
    const { code, error_subcode: subcode } = data.error || {};
    throw new Error(`Meta API ${res.status} (code ${code}, subcode ${subcode})`);
  }
  return toPublicPosts(data);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim());
  const headers = { Vary: "Origin" };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (url.pathname !== "/feed") {
      return json({ error: "not_found" }, 404, cors);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...cors, "Access-Control-Allow-Methods": "GET, OPTIONS" },
      });
    }
    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405, { ...cors, Allow: "GET, OPTIONS" });
    }

    // One shared cache entry for every visitor. Allowed-origin headers are
    // added per request, so they are never stored in the cache.
    const cacheKey = new Request(`${url.origin}/feed`);
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const cached = cache ? await cache.match(cacheKey) : null;
    if (cached) {
      return json(await cached.json(), 200, {
        ...cors,
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      });
    }

    let posts;
    try {
      posts = await fetchPosts(env);
    } catch (err) {
      console.error("Instagram feed failed:", err.message);
      return json({ error: "feed_unavailable" }, 502, { ...cors, "Cache-Control": "no-store" });
    }

    if (cache && ctx) {
      ctx.waitUntil(
        cache.put(
          cacheKey,
          json({ posts }, 200, { "Cache-Control": `public, max-age=${CACHE_SECONDS}` })
        )
      );
    }
    return json({ posts }, 200, {
      ...cors,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
    });
  },
};
