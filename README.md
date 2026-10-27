# SafeHaven Checkout — Next.js

A Next.js App Router implementation of the SafeHaven Checkout.js callback flow.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The included `.env.local` carries over the sandbox values from `checkout2.html` and is ignored by Git. Copy `.env.example` when configuring another environment.

## Production configuration

Set these environment variables in the deployment platform:

- `NEXT_PUBLIC_SAFEHAVEN_ENVIRONMENT=production`
- `NEXT_PUBLIC_SAFEHAVEN_CLIENT_ID`
- `NEXT_PUBLIC_SAFEHAVEN_BANK_CODE=090286`
- `NEXT_PUBLIC_SAFEHAVEN_ACCOUNT_NUMBER`
- `NEXT_PUBLIC_SAFEHAVEN_FEE_BEARER=account` or `customer`
- `NEXT_PUBLIC_SAFEHAVEN_WEBHOOK_URL` (optional)

`NEXT_PUBLIC_*` values are visible to browsers. Never place an OAuth client secret in them. Treat the browser callback as a user-interface signal only; verify payment from a trusted server/webhook before delivering goods or services.

See the [SafeHaven Checkout.js reference](https://safehavenmfb.readme.io/reference/checkout-js).
