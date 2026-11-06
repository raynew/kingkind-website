/**
 * Site configuration.
 *
 * Instagram feed
 * -------------
 * Set `instagram.feedUrl` to your Instagram feed Worker's /feed address.
 * See README.md for setup steps. Never put an access token in this file:
 * everything here is visible to visitors.
 *
 * When no address is set, the gallery shows the sample portraits and a link
 * to your Instagram profile.
 */
window.SITE_CONFIG = {
  photographer: "Rayne",
  email: "hello@kingkind.co.uk",

  instagram: {
    username: "akingkind",           // your Instagram handle (no @)
    feedUrl: "https://kingkind-instagram-feed.raynewelch.workers.dev/feed", // your Worker's address
    photoCount: 12,                  // how many posts to show (up to 12)
  },
};
