---
concept: http
title: HTTP & the Request Lifecycle
domain: networking
difficulty: 2
prerequisites: []
mastery: 0
---

## Definition
HTTP (HyperText Transfer Protocol) is a stateless, text-based request/response protocol running over TCP (or QUIC/UDP in HTTP/3) in which a client sends a request — a method, path, headers, and optional body — and the server returns a status code, headers, and optional body. Statelessness means every request is self-contained; continuity (auth, sessions) is layered on top via headers like `Cookie` and `Authorization`. HTTPS is HTTP wrapped in TLS, which authenticates the server via certificates and encrypts the channel. The full lifecycle spans DNS resolution, TCP connection, TLS handshake, request transmission, server processing, and response.

## Why it matters
Nearly every web system is glued together by HTTP, so "walk me through what happens when you type a URL and press enter" is one of the most common interviews screens — it probes DNS, TCP/TLS, caching, and status-code fluency in one question. Real debugging (a 401 vs 403, a CORS preflight failing, a mysterious 504 from a load balancer, caching that won't invalidate) all requires reading headers and status codes precisely. For a React/Next/Node engineer, understanding idempotency, caching headers, and the TLS handshake directly shapes API design and performance work.

## Common mistakes
- Confusing status codes: 401 (unauthenticated — no/invalid credentials) vs 403 (authenticated but not allowed); 301 (permanent, cached by browsers) vs 302/307 (temporary); 200 with an error body instead of a proper 4xx/5xx.
- Assuming methods are interchangeable. GET must be safe and idempotent (no side effects, cacheable); PUT and DELETE are idempotent; POST is neither. Retrying a non-idempotent POST can double-submit.
- Forgetting that HTTP is stateless — expecting the server to "remember" the last request without a cookie, token, or session store.
- Misconfiguring CORS and blaming the server: the browser sends a preflight `OPTIONS` for non-simple requests; the failure is a missing `Access-Control-Allow-*` header, not a server crash.
- Ignoring caching headers (`Cache-Control`, `ETag`, `Last-Modified`) and then wondering why a CDN serves stale content, or why nothing caches at all.
- Thinking HTTPS only "encrypts" — it also authenticates the server identity via the certificate chain; a valid cert prevents man-in-the-middle, not just eavesdropping.

## Real-world applications
- Next.js API routes / Route Handlers returning proper status codes and `Cache-Control` for edge caching.
- `fetch` in the browser/Node with `Authorization: Bearer <jwt>` for Supabase-authenticated calls.
- CDN (Vercel/Cloudflare) honoring `ETag` and `Cache-Control: s-maxage` to serve responses without hitting the origin.
- Webhooks (Stripe, GitHub) as POST requests whose signatures you verify from a header; you return 2xx fast to avoid retries.
- HTTP/2 multiplexing many requests over one connection to speed up asset-heavy React apps.

## Implementations
```ts
// The lifecycle, annotated (client -> server):
// 1. DNS: resolve api.example.com -> IP (recursive resolver, cached by TTL)
// 2. TCP: 3-way handshake (SYN, SYN-ACK, ACK) to IP:443
// 3. TLS: ClientHello -> ServerHello + certificate -> key exchange ->
//         both derive a session key; server identity verified via CA chain
// 4. HTTP request sent over the encrypted channel
// 5. Server processes, 6. Response streamed back

// Node/Next Route Handler illustrating methods, status codes, headers
export async function GET(req: Request) {
  const token = req.headers.get("authorization");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const data = await loadResource();
  if (!data) return new Response("Not Found", { status: 404 });

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      ETag: `"${data.version}"`,
    },
  });
}

// Idempotent PUT vs non-idempotent POST: retrying PUT is safe; retrying POST may duplicate.
```

## Practice problems
1. (easy) List the correct status code for each: valid login, wrong password, valid token but no permission, resource deleted, malformed JSON body, server exception.
2. (medium) Walk through every step from typing `https://app.example.com/dashboard` to seeing pixels, naming DNS, TCP, TLS, HTTP, and where caching can short-circuit each step.
3. (hard) Design a retry policy for a client calling a payment API: which methods are safe to retry automatically, how idempotency keys make POST retry-safe, and how you'd use `Retry-After` and exponential backoff on 429/503.

## Review schedule
Introduce early (no prerequisites) and revisit at 1d / 3d / 7d / 21d. Interleave with `caching` (HTTP caching headers, CDN) and `node-event-loop` (async I/O handling of many concurrent requests). Re-test with a live `curl -v` reading of headers and a status-code drill.
