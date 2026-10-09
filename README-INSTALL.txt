EDEN GMC CLOUD CRM PATCH

Supabase SQL setup and Passkeys have already been configured.

FILES
- cloud-v1.js: connects the app to the new Eden GMC Supabase project.
- resume-state-v1.js: remembers the last working screen.
- cloud-loader-v1.js: loads both modules and pushes newly-created public quotes into the cloud.

INSTALL
1. Upload all three JS files into the repository's docs folder.
2. In docs/index.html, immediately before </body>, add:
   <script src="./cloud-loader-v1.js?v=20261009-16" defer></script>
3. Commit the changes.
4. Open the GitHub Pages app in a private/incognito tab first.
5. Build a test quote WITHOUT logging in and save it.
6. Sign in as the Eden owner and open Customer CRM. The test quote should appear after cloud sync.

IMPORTANT
- The sb_publishable_ key is intentionally browser-visible.
- Never put the Supabase database password, secret key, or service-role key in GitHub.
- Owner login currently uses Supabase secure email sign-in. Passkeys are enabled in Supabase; the next step is registering the owner's passkey for Face ID/Touch ID.
