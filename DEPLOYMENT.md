# Deploying KIOSK to Render (render.com)

This repository is ready for deployment on **Render** as a Node.js Web Service with full Gemini Chatbot intelligence.

---

## Method 1: Automatic Blueprint Deployment (Recommended)

1. **Log in to Render**:
   Go to [https://dashboard.render.com](https://dashboard.render.com).

2. **Connect Blueprint**:
   - Click **New +** (top-right) → Select **Blueprint**.
   - Connect your GitHub repository: **`https://github.com/aks-45/kiosk`**.
   - Render will automatically read [`render.yaml`](./render.yaml).

3. **Set your Gemini API Key**:
   - In the prompt for `GEMINI_API_KEY`, paste your Gemini API key:
     `AIzaSyDj1qT4KuVVFnYknhUCnNVLVLkCQYKmgdg`

4. **Click Apply**:
   Render will automatically build and deploy the application.

---

## Method 2: Manual Web Service Setup

If you prefer to configure manually:

1. Click **New +** → **Web Service**.
2. Connect your GitHub repository **`aks-45/kiosk`**.
3. Fill in the following settings:
   - **Name**: `kiosk-terminal`
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npm run render-build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`

4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `20.18.0` |
   | `AI_PROVIDER` | `gemini` |
   | `DATABASE_URL` | `file:./dev.db` |
   | `GEMINI_API_KEY` | `AIzaSyDj1qT4KuVVFnYknhUCnNVLVLkCQYKmgdg` |

5. Click **Create Web Service**.

---

## Verification After Deployment
Once deployed, open your live Render URL:
- **Terminal Access**: Log in with Customer PIN `1234` or click Quick Access.
- **Kiosk Financial AI**: Navigate to `/ai` to test real-time financial intelligence and inline voice-to-text.
