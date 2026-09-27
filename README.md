# Eden GMC Quote App

Private working app for exterior-cleaning estimates and customer enquiries. The live version remains at https://eden-gmc-quote-calculator.mojoman419.chatgpt.site.

## What it does

- Price jobs by measured area, service, parking-space floor and agreed extras.
- Save enquiries and separately recorded marketing opt-ins.
- Prepare quote, nudge, invoice and follow-up email drafts.
- Store before/after images and optional timelapse clips.
- Export a calendar event with a three-day appointment alert.

## Running the source

Requires Node.js 22.13 or later. Install with `npm ci`, then run `npm run dev` for development or `npm run build` for the server build. The production app uses Cloudflare D1 and R2 via its Sites deployment configuration. Local development requires the corresponding bindings and migrations in `drizzle/`.

GitHub Pages only hosts static files. It cannot run this app's API routes, database, private media storage or authenticated enquiry log. Keep the repository private because it contains business workflow and deployment configuration. Customer data and uploaded images are stored separately and are not part of this source archive.

The email actions open drafts; files must be attached and messages sent manually. The calendar file must be imported to activate its reminder. Review invoice details and payment terms before sending.

## Source layout

- `app/`: calculator and API routes
- `db/`, `drizzle/`: database models and migrations
- `public/`: app icon and static assets
- `scripts/`, `build/`, `vite.config.ts`: build and runtime support
- `.openai/hosting.json`: current Sites bindings and project reference
