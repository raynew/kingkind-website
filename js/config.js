/**
 * Site configuration.
 *
 * Instagram feed
 * -------------
 * Set `instagram.accessToken` to a valid Instagram API user access token
 * for a professional account. See README.md for setup steps and security notes.
 *
 * When no token is set, the gallery falls back to a link to your Instagram
 * profile instead of loading photos.
 */
window.SITE_CONFIG = {
  photographer: "Rayne",
  email: "hello@kingkind.co.uk",

  instagram: {
    username: "akingind",            // your Instagram handle (no @)
    accessToken: "",                 // browser-visible; do not publish a private token
    photoCount: 12,                  // how many posts to show
  },
};
