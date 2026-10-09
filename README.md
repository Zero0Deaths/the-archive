# The Archive V2 — Vercel-ready

A mobile-friendly AI story app. Every HIT ME press calls a serverless API endpoint, which asks OpenAI to research and write a fresh true story. Bookmarks, ratings, and recent titles are saved in the browser's local storage (not synced across devices).

## Deploy to Vercel

1. Unzip this project.
2. Create a GitHub repository and upload the *contents* of the unzipped folder (index.html, api/, package.json, etc.). Do not upload your API key.
3. In Vercel, choose **Add New > Project**, import the GitHub repository, and deploy. Framework preset: **Other**. Root directory: repository root.
4. In the Vercel project, open **Settings > Environment Variables** and add `OPENAI_API_KEY` with your secret OpenAI API key. Apply it to Production (and Preview/Development if needed). Never prefix it with `NEXT_PUBLIC_` or put it in index.html.
5. **Redeploy** the project after adding the variable (Deployments > latest > Redeploy).
6. Open the deployed `*.vercel.app` URL and press HIT ME. The first request may take some time while web research runs.
7. On iPhone Safari: Share > Add to Home Screen.

## Notes

- OpenAI API credits are billed separately from ChatGPT subscriptions. Set budget limits and monitor usage.
- Server uses `gpt-4.1-mini` and the Responses API `web_search_preview` tool. Availability and pricing may change. If your project/model lacks access, the API returns a readable error.
- The AI is instructed to verify claims and provide sources, but you should still review source quality and factual accuracy.
- Vercel's function timeout is set to 60 seconds; plan limits may differ.
- This is a working prototype, not a production hardened app. There is no sign-in, rate limiting, or centralized database. Avoid publicly promoting the link until abuse protection is added, since anyone using it can consume your API credits.
