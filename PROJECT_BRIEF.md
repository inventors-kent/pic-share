# PicShare Booth Project Brief

Build **PicShare Booth**, a playful premium event photo booth web app for internal events. Guests should use an iPad or mobile-friendly web experience to take a burst of photos, customize the result, and instantly receive or download their images via QR code or optional email.

This is a **Next.js + Chakra UI** app. All styling must be done through **Chakra UI components, style props, recipes, semantic tokens, and the Chakra theme**. Raw CSS should be used only as an absolute last resort. Use the **Onest** font via `next/font/google` and wire it into the Chakra theme.

Before editing code, read the relevant local Next.js 16 docs in `node_modules/next/dist/docs/`, especially for App Router, route handlers, metadata, fonts, and any Next APIs being used.

## Product Goal

Create a fast, fun, touch-friendly event booth experience where guests can:

1. Start the booth without creating an account.
2. Grant camera access.
3. Take a configurable burst of photos, defaulting to 4.
4. Review and retake individual photos.
5. Customize the final output.
6. Generate a collage, strip, or GIF.
7. Scan a QR code to open a mobile-friendly download page.
8. Optionally enter an email to receive the same expiring download link.

The app should feel playful, lively, and polished, not like a boring SaaS dashboard. Visual direction: **playful premium event booth**.

## Target Context

This app is for our own events, running mainly on our own iPads. It should be:

- Tablet-first.
- Mobile-friendly.
- Desktop-supported.
- Responsive in iPad portrait and landscape.
- Designed for large touch targets and quick guest turnover.
- Anonymous for guests, with no account requirement.
- Private per-session links only. No public event gallery in v1.

## Core User Flow

Use this flow:

`Start / attract screen -> camera burst -> review photos -> retake individual photos if needed -> customize -> generate output -> QR/download/email share screen -> reset for next guest`

Details:

- First screen should be the actual booth start screen, not a marketing landing page.
- Include a lightweight consent line before starting.
- Default capture count: `4`, configurable.
- Countdown before each shot: default `3` seconds, configurable.
- Include a visual flash/success animation after each photo.
- Mirror the live camera preview, but do not mirror final output by default.
- After capture, show all thumbnails and allow individual retakes.
- Allow users to return from customization back to review/retake.
- Do not persist anything until the user generates the final output.
- After sharing, show `Done` / `Start new session`.
- Auto-reset after around 2 minutes of inactivity on the share screen.
- Start screen doubles as the idle/attract screen.

## Customization

After capture, users should customize the final output.

Core v1 customization:

- Layout: `2x2 grid`, `vertical strip`, `horizontal strip`, `GIF`
- Frame style: clean white booth strip, rounded color frame, instant-film frame, confetti border
- Background/accent color using Chakra theme swatches
- Sticker/overlay preset
- Optional caption text
- GIF speed: slow, normal, fast
- Optional event badge from config, such as event name/date

Sticker presets:

- Sparkle corners
- Party stars
- Tiny hearts
- "Good vibes" badge
- Event name/date badge

Filters are nice-to-have only. Do not make filters core v1.

Stickers should be preset-based in v1. Do not build drag/resize sticker editing yet.

## Output Generation

Use browser-side generation where practical:

- Use browser canvas for collage/strip composition.
- Use client-side GIF generation if practical, with a lightweight proven GIF encoder.
- Upload generated final assets to Cloudinary.
- Optionally upload source photos after generation.
- Store Cloudinary public IDs so cleanup can be added later.

The final mobile download page should allow:

- Download final output.
- Download individual photos.
- Download GIF when GIF was chosen.
- Send/resend to email.
- ZIP download is nice-to-have, not required for v1.

## Sharing

Use QR-first sharing.

- QR code should always be available after generation.
- Email should be optional.
- Email should send a download link, not large attachments.
- The QR code and email should point to the same mobile-friendly share page.
- Use unguessable tokenized links.
- Links expire after 24 hours.
- No login, no passcode.
- Anyone with the private unguessable link can access it until expiry.
- If email sending is in progress, still show the QR/download screen immediately.

## Routes

Recommended route structure:

- `/` guest booth flow
- `/s/[token]` mobile-friendly share/download page
- `POST /api/sessions` create session, upload media, store metadata
- `POST /api/sessions/[token]/email` send or resend email
- `GET /api/sessions/[token]` fetch share metadata if needed

Use App Router route handlers for upload/session/email operations.

## State Management

Use **Zustand** for ephemeral client-side booth state.

Store:

- current flow step
- camera/capture status
- captured photo blobs/data URLs
- selected layout/customization options
- generated preview/output state
- retake target
- reset session action

Do not persist captured photos to `localStorage` or other browser storage.

Do not use Zustand for server database state. Keep server/session data in API/service modules.

## Backend Providers

Production-ready providers:

- Media: **Cloudinary**
- Email: **Resend**
- Database: **Supabase Postgres**
- Deployment: **Vercel**

Keep the implementation simple and straightforward.

Use simple Supabase/Postgres access through a repository module. Do not use an ORM in v1. Create a `sessionRepository` or similar module.

Use real providers when env vars exist. Provide functional mock mode when credentials are missing.

## Database Model

Create a simple `photo_sessions` table/model.

Suggested fields:

- `id`
- `token`
- `created_at`
- `expires_at`
- `layout`
- `customization_json`
- `cloudinary_assets_json`
- `source_photo_assets_json`
- `final_asset_url`
- `final_asset_public_id`
- `gif_asset_url`
- `gif_asset_public_id`
- `email`
- `email_status`
- `email_sent_at`
- `last_email_error`

Access to expired sessions should be blocked. Automatic Cloudinary deletion can be a scheduled follow-up, not required in v1. Store public IDs so cleanup can be implemented later.

## Environment

Create `.env.example` with:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
DATABASE_URL=
APP_BASE_URL=
SHARE_LINK_EXPIRY_HOURS=24
```

## Styling And Design

Hard rule: Chakra UI and Chakra theme first.

Use:

- Chakra UI components
- Chakra style props
- Chakra recipes/slot recipes where useful
- Chakra semantic tokens
- Chakra theme tokens for colors, fonts, radii, shadows, spacing
- Onest as the primary interface font

Keep `globals.css` empty or minimal unless absolutely unavoidable.

Design direction:

- Playful premium
- Bright, tactile, polished
- Fun without feeling childish
- Large controls
- Smooth motion
- Clear progress
- Friendly microcopy
- Light mode only for v1

## Accessibility

Include practical accessibility:

- Large touch targets
- Keyboard-operable buttons
- Visible focus states
- Good contrast
- Clear camera permission error state
- `Try again` button if camera fails
- Labeled controls
- Respect reduced-motion where practical
- Responsive layouts that do not overlap or clip text

## Recommended Dependencies

Allow Codex to add dependencies as needed:

- `zustand`
- QR library such as `qrcode` or `react-qr-code`
- lightweight GIF generation library
- Cloudinary SDK
- Resend SDK
- `zod` for validation if useful
- lightweight Postgres client for Supabase Postgres

Do not hand-roll QR generation or GIF encoding.

## Implementation Order

Build in thin vertical slices:

1. Read relevant local Next.js 16 docs.
2. Set up Onest font and Chakra theme foundation.
3. Create booth config object.
4. Add Zustand booth store.
5. Build start/consent/idle screen.
6. Build camera preview, countdown, flash, and capture burst.
7. Build review and individual retake flow.
8. Build customization UI.
9. Build canvas collage/strip generation.
10. Add GIF generation.
11. Add share screen with QR code.
12. Add `/s/[token]` mobile download page.
13. Add Cloudinary, Supabase, and Resend service modules with mock fallback.
14. Add API routes.
15. Add tests for risky logic.
16. Run build/lint and responsive QA.

## Definition Of Done

MVP is done when:

- Guest can start the booth with lightweight consent.
- App captures 4 photos by default with countdown and flash.
- Guest can review and retake individual photos.
- Guest can customize layout, frame, color, sticker preset, caption, and GIF speed.
- App generates a final collage/strip/GIF preview.
- QR code opens a mobile-friendly download page.
- Email entry is optional and sends or simulates a Resend download-link email.
- Share links are tokenized and expire after 24 hours.
- Cloudinary is used or cleanly mocked for media.
- Supabase/Postgres is used or cleanly mocked for sessions.
- Styling is through Chakra UI/theme, with Onest.
- App is responsive on iPad portrait, iPad landscape, mobile, and desktop.
- App builds successfully.
- Focused tests exist for risky logic.
