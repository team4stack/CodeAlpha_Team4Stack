This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Supabase Configuration (Required for Authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL (Optional - defaults to http://localhost:5000/api)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Site URL (Optional - for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# EmailJS Configuration (Optional - for email verification)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key

# reCAPTCHA Site Key (Optional - for sign-in verification)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

**Note**: Authentication requires Supabase configuration. Without it, users will see an error message when trying to sign in.

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Optional: faster dev compiler (can be flaky on some Windows setups):

```bash
npm run dev:turbo
```

### Dev: `ERR_CONNECTION_REFUSED` / `ERR_CONNECTION_RESET` (Turbopack / HMR)

Those console errors mean the **browser could not load chunks from the Next dev server** — usually not an app bug.

| Error | Typical cause |
|--------|----------------|
| **ERR_CONNECTION_REFUSED** | Dev server is **not running**, **crashed**, or you opened the wrong **port** (e.g. 3000 vs 3001). |
| **ERR_CONNECTION_RESET** | Dev server **restarted** (save crash, nodemon, OOM) or **Turbopack HMR** dropped the connection mid-request. |

**What to do**

1. Run the frontend from the `frontend` folder: `npm run dev` (default uses the stable **webpack** dev server).
2. Keep **one** dev process on port 3000; if it says “port in use”, stop the old terminal or use another port: `npx next dev -p 3001`.
3. If you were using **`npm run dev:turbo`** and see many `turbopack` / `hmr-client` failures, switch back to **`npm run dev`**.
4. Hard refresh the tab (Ctrl+Shift+R) after the server is up again.

**Slow first load in dev** is normal with a large `app/globals.css`; the first compile is heavier; later navigations are usually faster.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
