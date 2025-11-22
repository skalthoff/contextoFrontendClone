
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // Proxy API requests
        if (url.pathname.startsWith("/api/")) {
            const targetPath = url.pathname.replace("/api/", "");
            const targetUrl = `https://api.contexto.me/machado/en/${targetPath}`;

            const newRequest = new Request(targetUrl, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });

            // Remove Origin and Referer headers to avoid issues with the upstream API
            newRequest.headers.delete("Origin");
            newRequest.headers.delete("Referer");

            try {
                const response = await fetch(newRequest);
                const newResponse = new Response(response.body, response);

                // Add CORS headers to the response
                newResponse.headers.set("Access-Control-Allow-Origin", "*");

                return newResponse;
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500 });
            }
        }

        // Serve static assets (default behavior for other requests)
        return env.ASSETS.fetch(request);
    },
};
