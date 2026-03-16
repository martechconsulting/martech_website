export async function onRequest(context) {
  return new Response('pulse function is alive', { status: 200 });
}
```

Commit it, wait for Cloudflare to redeploy, then open your browser and go directly to:
```
https://martechconsulting.io/api/pulse
