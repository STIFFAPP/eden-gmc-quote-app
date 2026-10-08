# GitHub Pages website

Publish `main` → `/docs` from Settings → Pages → Deploy from a branch.
Website: https://stiffapp.github.io/eden-gmc-quote-app/

This version keeps enquiries, consent records, invoice numbers and photos/videos in IndexedDB on the current browser. Data does not sync between devices. Use Export backup / Restore backup to transfer or protect records. Clearing site data removes local records. No customer information is committed to GitHub.

Email buttons prepare drafts in your email app; attach downloaded photos or invoices before sending. The calendar download includes a three-day reminder; import it into your calendar and check the alert. This website does not send automatic emails or reminders itself.

The original hosted full-stack app and source files remain separate and available.

## Rebuild

In `pages-src`, run `npm install` then `npm run build`. Commit the resulting `docs/app.js` with source changes. The prebuilt website needs no build on GitHub.
