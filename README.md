# My Vite + React App

A minimal **Vite 5 + React 18** template that deploys to **GitHub Pages** using **GitHub Actions** (no local installs required).

## How it works

1. Vite builds the app to `/dist`.
2. GitHub Actions runs `npm install` and `npm run build` on push.
3. The workflow injects `BASE_PATH='/my-vite-react-app/'` so the site works at `https://<username>.github.io/my-vite-react-app/`.
4. Pages deploys the `/dist` artifact.

## Quick start (no local installs)

1. Create a **public** GitHub repo named `my-vite-react-app`.
2. Upload these files to the repo root:
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `src/App.jsx`
   - `src/main.jsx`
   - `.github/workflows/deploy.yml`

### Dotfolder tip (`.github`)

GitHub's web uploader sometimes hides dotfolders. Use **Add file → Create new file** and enter this path exactly:
`.github/workflows/deploy.yml`

Paste the workflow content and commit. GitHub will create the folders automatically.

3. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Make any commit to `main` (for example edit this README) to trigger the workflow.
5. Watch **Actions** until “Deploy to GitHub Pages” is green.
6. Open: `https://<username>.github.io/my-vite-react-app/`

## Customize

- `src/App.jsx` is the demo UI and state
- `src/main.jsx` is the React bootstrap
- `index.html` controls the HTML shell and `<title>`
- `vite.config.js` keeps `base` dynamic via `process.env.BASE_PATH`
- `.github/workflows/deploy.yml` controls CI/CD

## Local dev (optional)

If you do want to run locally later:

```bash
npm install
npm run dev
