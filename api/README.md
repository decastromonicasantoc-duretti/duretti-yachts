# DURETTI Concierge API

`concierge.js` is a Node.js 18+ Vercel Function served at `/api/concierge`. It uses the OpenAI Chat Completions API format and keeps provider credentials on the server. The FAQ and answer rules are maintained in `../knowledge/concierge-faq.js` and the API handler. The root [vercel.json](../vercel.json) serves this root-level static site, including the existing `public/assets/` paths, and configures a 25-second function maximum.

Configure these **server-side** environment variables in the hosting platform:

- `OPENAI_API_KEY` — the provider API key; never expose it to the browser.
- `OPENAI_MODEL` — a model available to the configured account.
- `OPENAI_BASE_URL` — optional HTTPS Chat Completions endpoint. Defaults to `https://api.openai.com/v1/chat/completions`.

## Vercel setup

1. Import the repository into Vercel. Use the repository root as the project root, choose the **Other** framework preset, and leave the Build Command empty. The output directory is set to `.` by `vercel.json`, so the root `index.html` and existing asset paths stay intact.
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` and `OPENAI_MODEL` as server-side variables for the deployment environments you intend to use. Optionally add `OPENAI_BASE_URL` only for an HTTPS endpoint using the OpenAI Chat Completions request and response format.
3. Deploy or redeploy. Do not put the API key in website files, `index.html`, browser-visible variables, or chat.
4. Check `https://<your-deployment>/api/concierge`. It should return `{"configured":true}` once the required server variables are present; the chat header will then say **AI setup detected**. This check does not validate the provider key or model. Send a chat message in the deployed site to verify the full provider connection; provider errors are surfaced in the conversation.

Without the deployed route and all required environment variables, `GET /api/concierge` reports `configured: false` and `POST /api/concierge` returns a setup error; the website then offers direct email links. No chat messages are logged or stored by this handler.

GPT-5 and o-series reasoning models use `max_completion_tokens`; standard models use `max_tokens` and temperature. If the provider rejects the legacy parameter form, the function retries once with the compatible reasoning-model parameters. Environment-variable values are trimmed before use. Provider failures are logged with only the HTTP status and sanitized error code/type/parameter; credentials, raw provider messages, and visitor messages are not logged or returned. Responses distinguish credential, model/account access, usage-limit, and request-configuration errors without exposing provider details.

The in-memory limit (20 messages per IP per 10 minutes) is a basic per-instance safeguard, not a replacement for Vercel's edge rate limiting. The hosting platform's `X-Forwarded-For` header is used as the rate-limit key.
