const CHECKOUT_SCRIPT_URL = "https://checkout.safehavenmfb.com/assets/checkout.min.js";

export async function GET() {
  try {
    const upstream = await fetch(CHECKOUT_SCRIPT_URL, {
      next: { revalidate: 86_400 },
    });

    if (!upstream.ok) {
      return new Response("SafeHaven Checkout is temporarily unavailable.", {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(await upstream.text(), {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("SafeHaven Checkout is temporarily unavailable.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
