# Rael Rodriguez: personal site

Plain HTML/CSS/JS, no build step, no framework. Five pages, two stylesheets, one JS file.

## Files
- `index.html`: home page (QR/NFC landing)
- `coaching.html`: life coaching subpage, linked from home
- `content.html`: content channel directory, linked from home
- `ugc.html`: UGC portfolio, single page with in-page section navigation, linked from the "UGC" block on `content.html`. Deliberately uses a different visual theme (crimson/black/cream) from the rest of the site
- `live.html`: streaming page, intentionally **not linked** from anywhere; share the direct URL by text/email when going live
- `style.css`: shared styles for every page except `ugc.html` (navy/gold/cream palette, responsive: stacks on mobile, splits two-column on desktop)
- `ugc-style.css`: styles for `ugc.html` only
- `live-status.js`: live schedule + manual override, see below
- `assets/`: logo files, your headshot, and the brand logos used on `ugc.html`

## Setting this up as a GitHub repo
From this folder:
```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
Everything here is relative paths (`assets/logo-rr-mark.png`, `style.css`, etc.), so it works the same whether you open `index.html` locally, host it on GitHub Pages, or deploy it through Netlify.

## Still needs your real content
- Headshot: replace the placeholder circle in `index.html` (`<div class="headshot">`) with `<img src="assets/rael-headshot.jpg" alt="Rael Rodriguez">` (the file's already in `assets/`, just needs wiring into that one spot)
- Real LinkedIn URL (currently a placeholder in `index.html`)
- Confirm the R Star Solutions / business site URL
- Confirm social handles are correct (`keepingit_rael` is still a placeholder for Instagram/YouTube on `index.html` and `content.html`; `raelreviews` is the confirmed handle used on `ugc.html`)
- `content.html`'s Writing block still links to `#`, needs a real URL once you have a destination for it
- `content.html`'s Features block has three placeholder links, swap each `href="#"` and label for a real appearance, podcast, or press mention once you have them
- `ugc.html`'s "My content" section has 12 empty video slots across three categories (Health & wellness, Software & tech, Improvement products), each a placeholder for a real vertical video link once you have footage
- `ugc.html`'s "Product photos" section has 6 empty photo slots, same idea but for static images
- `ugc.html`'s "Services" and "The process" sections have placeholder copy (generic UGC-creator service structure, not your real rates or process) — swap in your actual offering
- A few brand links on `ugc.html` (PIA VPN, EWG Healthy Living, Elevate, Wonder, Respire, Conquering) are my best guess at the correct official domain, worth double-checking before this goes live
- `ugc.html` is currently a placeholder URL slug; when you deploy, you can rename this file (or configure a redirect) so it lives at whatever path you want (`raelrodriguez.com/UGC`, etc.)

## Deploying to Netlify
1. Push this folder to the GitHub repo above, then connect that repo in Netlify ("Add new site" → "Import an existing project"). Or skip GitHub and drag-and-drop the folder directly into Netlify's dashboard ("Deploys" → "Deploy manually").
2. No build command needed, it's static files, publish directory is the project root.
3. Once deployed, go to **Site settings → Forms → Form notifications → Add notification → Email notification** and point it at your inbox. That's what makes the coaching page's inquiry form email you on every submission, no extra code required.

## Going live
The page is set to automatically show "LIVE NOW" every **Monday and Thursday, 7:45-9:30 PM Eastern**, no action needed on stream days, it just works off the schedule in `live-status.js`. It rechecks the time once a minute, so a tab left open updates itself right when a window starts or ends.

For anything outside that recurring schedule (an extra stream, or skipping a scheduled day), open `live-status.js` and set:
```js
window.SITE_LIVE_STATUS = {
  live: true,   // or false to force OFFLINE for a skipped day
  platform: "twitch", // or "youtube" / "instagram"
  schedule: [ /* leave as-is */ ]
};
```
Redeploy (or just push the change if connected to git, Netlify auto-deploys). Set `live` back to `"auto"` once the one-off is over so the regular schedule takes over again.

To change the recurring days/times themselves, edit the `schedule` array in `live-status.js`. Each entry is a day (0=Sun...6=Sat) plus a start/end time in 24-hour Eastern Time.

This schedule-based approach is a placeholder for later swapping in Twitch's public API to auto-detect live status directly. The page's JS is already structured so that's a drop-in change rather than a rebuild, whenever you're ready for it.
