# KingKind — Portrait Photography

A small static portfolio for portrait photography. Serve this folder with any
static host, or preview it locally with:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Publish on GitHub Pages

This project repository publishes at <https://raynew.github.io/kingkind-website/>.
After pushing the `main` branch, open the repository's **Settings → Pages**,
choose **Deploy from a branch**, select `main` and `/(root)`, then save. GitHub
will publish the site and show its deployment status on that page.

## Instagram gallery

The gallery can load recent image posts from the photographer's Instagram
professional account through Meta's Instagram API with Instagram Login. Until
the feed is configured, the page displays sample portraits and links to the
Instagram profile.

1. Create and configure a Meta app for the Instagram API with Instagram Login.
2. Connect the photographer's professional Instagram account and grant the
   `instagram_business_basic` permission.
3. Generate an access token for that account.
4. In `js/config.js`, set the Instagram username and token:

   ```js
   instagram: {
     username: "your_handle",
     accessToken: "your_access_token",
     photoCount: 12,
   },
   ```

The feed requests up to 12 recent posts and displays image posts. If the
request fails or returns no images, the sample portraits remain visible.

**Token security:** a token placed in `js/config.js` is sent to every site
visitor's browser. Do not put a private or valuable token in a public site or
repository. For a public deployment, fetch Instagram posts through a small
server-side function and keep the token in the host's environment variables.

## Customize

- Edit the page copy in `index.html`.
- Set the Instagram handle and contact email in `js/config.js`.
- Change typography and colors in the variables at the top of
  `css/style.css`.
- Replace the Unsplash sample portraits in `index.html` with licensed images
  from the photographer before publishing.