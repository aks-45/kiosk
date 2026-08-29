# Deploying Smart Banking Kiosk to Render (render.com)

This repository is fully configured for seamless deployment on **Render** as a Node.js Web Service.

---

## Quick Deployment via Render Blueprint (Recommended)

1. **Push your code to GitHub / GitLab**:
   Ensure your repository is committed and pushed to GitHub or GitLab.

2. **Log into Render**:
   Go to [https://dashboard.render.com](https://dashboard.render.com) and log in.

3. **Create a New Blueprint**:
   - Click **New +** top right → Select **Blueprint**.
   - Connect your GitHub repository (`kiosk` or `smart-banking-kiosk`).
   - Render will automatically detect `render.yaml` in your project root!

4. **Set Environment Variables**:
   In the Render Dashboard Environment settings for the service, add:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key.
   - `OPENAI_API_KEY`: *(Optional)* Your OpenAI API Key (if using OpenAI).
   - `NEXT_PUBLIC_APP_URL`: Your Render public service URL (e.g. `https://smart-banking-kiosk.onrender.com`).

5. **Deploy**:
   Click **Apply**. Render will automatically run:
   - `npm install`
   - `npx prisma generate`
   - `npx prisma db push --accept-data-loss`
   - `npx tsx prisma/seed.ts` (seeds initial demo account `SBK001` & transactions)
   - `next build`
   - `next start`

---

## Manual Web Service Setup on Render

If you prefer to configure the Web Service manually on Render:

1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `smart-banking-kiosk`
   - **Environment**: `Node`
   - **Region**: Select your preferred region (e.g. Singapore / Oregon / Frankfurt).
   - **Branch**: `main` (or your active branch).
   - **Build Command**: 
     ```bash
     npm install && npm run render-build
     ```
   - **Start Command**: 
     ```bash
     npm run start
     ```
   - **Instance Type**: `Free` (or standard).

4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:./dev.db` |
   | `GEMINI_API_KEY` | *Your Gemini API Key* |

5. Click **Create Web Service**.

---

## Verification After Deployment
Once deployed, open your Render URL (e.g. `https://smart-banking-kiosk.onrender.com`):
- Click **ACCESS KIOSK TERMINAL** or log in with **Customer ID**: `SBK001`, **PIN**: `1234`.
- Explore all 6 modules including **`SMART BANKING GUIDE`**.
