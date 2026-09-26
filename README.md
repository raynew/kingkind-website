# KingKind — Portrait Photography

A small static portfolio for portrait photography. Serve this folder with any
static host, or preview it locally with:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Publish on GitHub Pages

This project repository publishes at <https://raynew.github.io/kingkind-website/>.
After pushing the `main` branch, open the repository's **Settings → Pages**
and set **Build and deployment → Source** to **GitHub Actions**. The workflow
in `.github/workflows/deploy.yml` then deploys the site on every push to `main`.
The published site is <https://raynew.github.io/kingkind-website/>.

## Instagram gallery

The gallery can load recent image posts from the photographer's Instagram
professional account through Meta's Instagram API with Instagram Login. Until
the feed is configured, the page displays sample portraits and links to the
Instagram profile.

1. Create and configure a Meta app for the Instagram API with Instagram Login.
2. In the app dashboard, open **Instagram → API setup with Instagram Business
  Login**, connect the photographer's professional (Business or Creator)
  account, and generate a token with the `instagram_business_basic`
  permission.
3. Set the account's handle in `js/config.js` (without the `@`).

For a local-only test, you can temporarily set `accessToken` there:

   ```js
   instagram: {
    username: "akingind",
     accessToken: "your_access_token",
     photoCount: 12,
   },
   ```

The feed requests up to 12 recent image posts. If the request fails or returns
no images, the sample portraits remain visible. Meta dashboard tokens last
about 60 days.

**Important for the live site:** this GitHub repository and its Pages site are
public. Any token in `js/config.js` is visible to visitors; never commit or
deploy it there. GitHub Pages cannot keep API credentials secret. For a live
automatic feed, use a server-side function (for example, a Cloudflare Worker)
that stores the token as an environment secret and returns only the public
image data, or use an Instagram feed provider. Without that proxy/provider,
the public site should keep showing the sample portraits and Instagram link.

## Customize

- Edit the page copy in `index.html`.
- Set the Instagram handle and contact email in `js/config.js`.
- Change typography and colors in the variables at the top of
  `css/style.css`.
- Replace the Unsplash sample portraits in `index.html` with licensed images
  from the photographer before publishing.