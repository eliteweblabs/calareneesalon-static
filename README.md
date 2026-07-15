# Cala Renee Salon — static homepage

Static HTML snapshot of the [LuxeMeds](https://luxemeds.com/) homepage layout, rebranded for **calareneesalon.com** and served on Railway.

## Local dev

```bash
npm install
npm run prepare:site   # optional: re-run HTML cleanup after re-mirroring
npm run dev
```

Open http://localhost:3000

## Re-mirror from luxemeds.com

```bash
rm -rf public
wget -e robots=off -p -k -nH --cut-dirs=0 --no-parent --convert-links \
  --adjust-extension --page-requisites --span-hosts \
  --domains=luxemeds.com,fonts.googleapis.com,fonts.gstatic.com \
  -P ./public "https://luxemeds.com/"
npm run prepare:site
```

## Railway

- Connect this repo in Railway or deploy via Dockerfile.
- Generate a Railway domain, then add custom domains:
  - `calareneesalon.com` → Railway A record `66.33.22.191`
  - `www.calareneesalon.com` → CNAME to `<service>.up.railway.app`
- Set `RAILWAY_PUBLIC_DOMAIN=calareneesalon.com` if other tooling needs it.

## Notes

- Product/cart links are stubbed to `#` — this is a static landing page only.
- Some WooCommerce JS was removed; layout/CSS/images are local under `public/`.
