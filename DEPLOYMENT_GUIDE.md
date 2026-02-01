# Deployment Guide for Restecsol Talent Bloom

This project is a **Vite + React** single-page application (SPA) with a **Supabase** backend. It is currently configured with a Git remote and is ready for deployment to static hosting platforms like Vercel or Netlify.

## Prerequisites
1.  **GitHub Repository**: Ensure your latest changes are pushed to GitHub.
    *   Current Remote: `https://github.com/lucky365ai/Restecsol-Talent-Bloom.git`
2.  **Supabase Project**: Ensure your Supabase project (`ppprclvarnrhthpbyqyf`) is running and has the necessary tables created (migrations applied).

## Option 1: Deploy to Vercel (Recommended)

Vercel is the creator of Next.js and has excellent support for Vite apps.

1.  **Sign Up/Log In**: Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2.  **Add New Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Import the repository **`Restecsol-Talent-Bloom`**.
3.  **Configure Project**:
    *   **Framework Preset**: It should automatically detect **Vite**.
    *   **Root Directory**: Leave as `./` (default).
    *   **Build Command**: `vite build` (or `npm run build`).
    *   **Output Directory**: `dist`.
4.  **Environment Variables** (Crucial):
    *   Expand the **"Environment Variables"** section.
    *   Copy the values from your local `.env` file and add them key-by-key:
        *   `VITE_SUPABASE_PROJECT_ID`: `ppprclvarnrhthpbyqyf`
        *   `VITE_SUPABASE_URL`: `https://ppprclvarnrhthpbyqyf.supabase.co`
        *   `VITE_SUPABASE_PUBLISHABLE_KEY`: *(Copy the long key starting with eyJ...)*
5.  **Deploy**: Click **"Deploy"**.
    *   Vercel will build your site and verify deployment.
    *   Once done, you will get a live URL (e.g., `restecsol-talent-bloom.vercel.app`).

## Option 2: Deploy to Netlify

1.  **Sign Up/Log In**: Go to [netlify.com](https://netlify.com).
2.  **Add New Site**: Click **"Add new site"** -> **"Import from an existing project"**.
3.  **Connect to GitHub**: Select GitHub and authorize.
4.  **Select Repo**: Choose **`Restecsol-Talent-Bloom`**.
5.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  **Environment Variables**:
    *   Click **"Show advanced"** or go to "Site settings" > "Environment variables" after creation.
    *   Add the same variables as above (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.).
7.  **Deploy Site**: Click **"Deploy site"**.

## Post-Deployment Checks

1.  **Visit the URL**: Open your deployed link.
2.  **Test Auth**: Try logging in/signing up to ensure the Supabase connection (Authentication) works.
    *   *Note*: You may need to add your production URL (e.g., `https://your-app.vercel.app`) to "Site URL" and "Redirect URLs" in your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**. If you don't do this, login redirects might fail.
3.  **Check Console**: If something is broken, check the browser developer console (F12) for errors.

## Backend (Supabase)

Your backend is managed by Supabase, so there is no separate deployment step for it provided you are pointing to the live instance. However, ensure that:
*   Your database schema (tables/columns) in the live Supabase project matches what your app expects.
*   Row Level Security (RLS) policies are set correctly to secure your data.
