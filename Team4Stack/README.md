# Team4Stack

This repository contains the complete Team4Stack website.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/team4stack.git
   ```

2. Navigate to the project directory:
   ```bash
   cd team4stack
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the necessary variables (refer to `.env.example`):

```bash
   cp .env.example .env
```

Then update the values in the `.env` file with your actual credentials.

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

To create a production build:

```bash
npm run build
```

### Preview

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and sign in
3. Click "New Project" and select your repository
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. IMPORTANT: Add environment variables in the Vercel dashboard:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add all the variables from your `.env` file:
     - `VITE_SUPABASE_URL` (required)
     - `VITE_SUPABASE_ANON_KEY` (required)
     - `VITE_SITE_URL` (optional, but recommended for production - set to your live website URL, e.g., `https://team4stack.com`)
     - `VITE_RECAPTCHA_SITE_KEY`
     - `VITE_CONTACT_EMAIL`
     - `VITE_PRIMARY_PHONE`
     - `VITE_TEAM_MEMBER_1_PHONE`
     - `VITE_TEAM_MEMBER_2_PHONE`
     - `VITE_TEAM_MEMBER_3_PHONE`
     - `VITE_TEAM_MEMBER_4_PHONE`
     - `VITE_FIVERR_PROFILE_URL`
     - `VITE_YOUTUBE_API_KEY`
   
   **Note:** Setting `VITE_SITE_URL` to your production URL (e.g., `https://team4stack.com`) ensures OAuth redirects work correctly in production. Without it, the app will use `window.location.origin` which should work, but explicitly setting it is recommended.
6. Click "Deploy"

The application will be automatically deployed and available at a Vercel URL.

### Vercel Configuration

This project includes a `vercel.json` file with the following configuration:

- Rewrites all routes to `index.html` for client-side routing
- Security headers for XSS protection, clickjacking protection, and content-type sniffing prevention