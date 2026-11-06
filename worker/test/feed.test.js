import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import worker from "../src/index.js";

const env = {
  IG_USER_ID: "123",
  IG_ACCESS_TOKEN: "SECRET_TOKEN",
  ALLOWED_ORIGINS: "https://kingkind.co.uk,http://localhost:8080",
};
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function mockMeta(body, status = 200) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify(body), { status });
  };
  return calls;
}

function get(path = "/feed", origin = "https://kingkind.co.uk") {
  return new Request(`https://feed.test${path}`, { headers: { Origin: origin } });
}

test("keeps images and carousels, and leaves out videos", async () => {
  mockMeta({
    data: [
      { media_type: "IMAGE", media_url: "https://cdn/a.jpg", permalink: "p/a", caption: "A" },
      {
        media_type: "CAROUSEL_ALBUM",
        media_url: "https://cdn/b.mp4",
        permalink: "p/b",
        children: {
          data: [
            { media_type: "VIDEO", media_url: "https://cdn/b.mp4" },
            { media_type: "IMAGE", media_url: "https://cdn/b.jpg" },
          ],
        },
      },
      { media_type: "VIDEO", media_url: "https://cdn/c.mp4", permalink: "p/c" },
    ],
  });
  const res = await worker.fetch(get(), env);
  const { posts } = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(posts.map((p) => p.image), ["https://cdn/a.jpg", "https://cdn/b.jpg"]);
});

test("returns at most 12 posts", async () => {
  mockMeta({
    data: Array.from({ length: 20 }, (_, i) => ({
      media_type: "IMAGE",
      media_url: `https://cdn/${i}.jpg`,
    })),
  });
  const { posts } = await (await worker.fetch(get(), env)).json();
  assert.equal(posts.length, 12);
});

test("never exposes the token, even when Meta returns an error", async () => {
  const calls = mockMeta({ error: { code: 190, message: "bad token" } }, 400);
  const res = await worker.fetch(get(), env);
  const text = await res.text();
  assert.equal(res.status, 502);
  assert.equal(calls.length, 1);
  assert.ok(!text.includes("SECRET_TOKEN"));
  assert.ok(!text.includes("bad token"));
});

test("allows browser access only from listed websites", async () => {
  mockMeta({ data: [] });
  const allowed = await worker.fetch(get(), env);
  assert.equal(allowed.headers.get("Access-Control-Allow-Origin"), "https://kingkind.co.uk");
  const blocked = await worker.fetch(get("/feed", "https://example.com"), env);
  assert.equal(blocked.headers.get("Access-Control-Allow-Origin"), null);
});

test("only serves GET /feed", async () => {
  assert.equal((await worker.fetch(get("/other"), env)).status, 404);
  const post = new Request("https://feed.test/feed", { method: "POST" });
  assert.equal((await worker.fetch(post, env)).status, 405);
});
