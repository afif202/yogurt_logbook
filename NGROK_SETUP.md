# NGROK Setup for YogurtTrack (quick)

This file lists the minimal steps to run the Laravel app through ngrok for testing.

1. Start the Laravel server binding to 0.0.0.0:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

2. Start ngrok pointing at port 8000:

```bash
ngrok http 8000
# If you see content mismatch, try:
# ngrok http 8000 --host-header="localhost:8000"
```

3. Copy the HTTPS url provided by ngrok (e.g. `https://abc123.ngrok.io`) and set it in your `.env`:

```
APP_URL=https://abc123.ngrok.io
# Optional: trust proxies explicitly (comma separated) e.g.
TRUSTED_PROXIES=*
# If ngrok runs on HTTPS and you want secure cookies:
SESSION_SECURE_COOKIE=true
# SESSION_DOMAIN can be set to ".ngrok.io" for all subdomains, but it's optional.
# SESSION_DOMAIN=.ngrok.io
```

4. Clear Laravel caches after changing `.env`:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

5. Vite/HMR notes:
- Easiest: run `npm run build` and use the built assets (no HMR needed).
- If you need HMR over ngrok, configure `vite.config.js` to use `host: '0.0.0.0'` and HMR protocol `wss` using the ngrok host.

6. Debugging tips:
- If authentication / redirects fail, inspect cookies in browser devtools (domain & secure flag).
- If assets 404, make sure `APP_URL` and the `mix()`/`asset()` helpers produce the correct host or use built assets.

If you want, I can also:
- Add a `.env.example` snippet into the repo with the recommended variables, and
- Create a small artisan command or npm script to automate clearing caches after setting APP_URL.
