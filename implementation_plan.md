# Implementation Plan

## Goal Description
Integrate a Groq‑powered AI assistant (Claude‑style) into the ADA Lab Companion. When a user visits any lab page, they can open a floating chat modal, paste code or ask questions, and receive detailed explanations streamed from the Groq model.

## User Review Required
- **UI placement**: We will add a floating chat modal toggled by a button in the bottom‑right corner of every page. If you prefer a permanent sidebar or inline widget, let us know.
- **API key handling**: The Groq API key will be read from `process.env.GROQ_API_KEY` (placed in `.env.local` or Vercel env vars). Ensure the key is added before deployment.

## Open Questions
> [!IMPORTANT]
> - Should the assistant automatically include the current page’s source code (e.g., `Visualizer.js`) in the prompt, or will the user paste the code manually?
> - Do you want streaming responses (as chunks) or a single full response?

## Proposed Changes
---
### 1. Dependencies
- **Modify** `package.json` to add `"groq-sdk": "^0.1.0"`.
---
### 2. Groq client wrapper
- **New** `src/lib/groqClient.js` that exports `getGroqCompletion(messages, options)` using the provided snippet and concatenates streamed chunks.
---
### 3. API route (App Router)
- **New** `src/app/api/groq-chat/route.js` handling `POST` requests, calling the client wrapper, and returning JSON `{ answer }`.
---
### 4. Floating chat modal component
- **New** `src/components/AIChatModal.js` (client component) implementing a toggle button, chat UI, and calls to `/api/groq-chat`.
---
### 5. Layout integration
- **Modify** `src/app/layout.js` to import and render `<AIChatModal />` globally.
---
### 6. Styling enhancements
- **Modify** `src/app/globals.css` to add glassmorphism utilities and micro‑animation classes for chat bubbles.
---
### 7. Environment variable
Create `.env.local` at project root with:
```
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```
Add the same variable in Vercel settings for production.
---
## Verification Plan
### Automated
- Run `npm run dev`, open any lab page, click the AI button, ask "Explain the Visualizer component". Expect a non‑empty reply within a few seconds.
### Manual
- Deploy to Vercel (`npm run build && npm run start`). Verify the modal works on desktop and mobile, respects dark mode, and the API key is not exposed in the client bundle.
---
## Summary
The changes add a Groq SDK dependency, a server‑side API endpoint, a reusable client‑side chat modal, and necessary styling. Once approved, I will implement all files and run tests.
