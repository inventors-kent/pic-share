# Environment Setup

PicShare Booth uses Cloudinary for media, Resend for email, Supabase Postgres for session storage, and `APP_BASE_URL` for generated share links.

Keep real secrets in `.env.local` for local development and in your Vercel project environment variables for deployment. Do not commit real secrets. Only `.env.example` should be committed.

## Cloudinary

Create or log in to your Cloudinary account, then open the Cloudinary Console / Dashboard.

Set these values:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- `CLOUDINARY_CLOUD_NAME`: Found in the Cloudinary dashboard as **Cloud name**.
- `CLOUDINARY_API_KEY`: Found in the Cloudinary credentials or API keys area.
- `CLOUDINARY_API_SECRET`: Found beside the API key. Treat this as private and server-only.

Cloudinary reference: [Where do I find my API key and API secret credentials?](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials)

## Resend

Create or log in to your Resend account.

Set these values:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

- `RESEND_API_KEY`: Go to **API Keys** in the Resend dashboard, create a key, and copy it. Resend keys usually start with `re_`.
- `RESEND_FROM_EMAIL`: The sender address used for booth delivery emails.

Recommended production format:

```env
RESEND_FROM_EMAIL="PicShare Booth <photos@yourdomain.com>"
```

For real guest emails, verify your own sending domain in Resend first.

Resend references:

- [API Keys](https://resend.com/docs/dashboard/api-keys/introduction)
- [CLI docs with from-address note](https://resend.com/docs/cli)

## Supabase Postgres

Create or log in to Supabase, create a project, then open that project dashboard.

Set this value:

```env
DATABASE_URL=
```

Go to **Project Settings -> Database -> Connection string / Connection info** and copy the Postgres connection string.

It will look roughly like this:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your database password.

For Vercel/serverless deployment, use the connection string Supabase recommends for server-side/serverless app usage, often the pooled connection string.

Supabase reference: [Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)

## App Base URL

Set this value:

```env
APP_BASE_URL=http://localhost:3000
```

For local development:

```env
APP_BASE_URL=http://localhost:3000
```

For Vercel production, use the deployed URL:

```env
APP_BASE_URL=https://your-vercel-domain.vercel.app
```

For a custom domain:

```env
APP_BASE_URL=https://photos.yourdomain.com
```

The app uses this value to generate QR-code and email download links.

## Local File

Create `.env.local` from `.env.example`:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
DATABASE_URL=
APP_BASE_URL=http://localhost:3000
SHARE_LINK_EXPIRY_HOURS=24
```

The app can run in mock mode without these credentials, but production delivery needs Cloudinary, Resend, and Supabase configured.
