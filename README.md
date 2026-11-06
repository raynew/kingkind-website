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

The gallery shows up to 12 recent image and carousel posts from
[@akingkind](https://www.instagram.com/akingkind/). Videos are left out. If the
feed isn't configured or can't be reached, the page shows the sample portraits
and a link to the Instagram profile.

GitHub Pages is public and can't keep secrets, so the access token lives in a
small Cloudflare Worker (`worker/`). The site asks the Worker for posts, and the
Worker returns only public details. **Never put the token in `js/config.js` or
commit it anywhere.**

### Get an access token

1. In the King Kind business portfolio, open **Settings → Users → System users**
   and add a system user with the **Employee** role. Meta rejected the name
   `KingKind Website System User`, so choose a different one.
2. Select the system user, click **Assign assets**, and assign the `akingkind`
   Instagram account and the **KingKind Website** app.
3. Click **Generate token**, select the app, tick `instagram_basic`, and choose
   the expiry. Save the token in a password manager.

The token from the app's **API setup with Unified login** page did not work for
this account: Meta listed no Instagram account against it.

### Deploy the Worker

You need a free Cloudflare account. From the `worker` folder:

```bash
npx wrangler login
```

```bash
npx wrangler secret put IG_ACCESS_TOKEN
```

```bash
npx wrangler deploy
```

Then set `instagram.feedUrl` in `js/config.js` to the address that `deploy`
prints, followed by `/feed`, and push the site.

To replace the token later, run the `secret put` command again. The site's
addresses are listed in `ALLOWED_ORIGINS` in `worker/wrangler.toml`; update them
if the domain changes. Run the Worker's tests with `npm test` from `worker`.

## Customize

- Edit the page copy in `index.html`.
- Set the Instagram handle and contact email in `js/config.js`.
- Change typography and colors in the variables at the top of
  `css/style.css`.
- Replace the Unsplash sample portraits in `index.html` with licensed images
  from the photographer before publishing.