import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function corsProxyPlugin(): Plugin {
  return {
    name: 'vite-plugin-cors-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url!, 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl || !targetUrl.startsWith('http')) {
            res.statusCode = 400;
            res.end('Invalid or missing url parameter');
            return;
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => {
            try {
              controller.abort();
            } catch {
              // ignore
            }
          }, 10000);

          const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept':
                'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
          });
          clearTimeout(timeout);

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader(
            'Content-Type',
            response.headers.get('content-type') || 'text/html; charset=utf-8'
          );

          const buffer = await response.arrayBuffer();
          res.statusCode = response.status;
          res.end(Buffer.from(buffer));
        } catch (error: any) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 502;
          res.end(`Proxy error: ${error?.message || 'unknown'}`);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), corsProxyPlugin()],
  base: './',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/colormind': {
        target: 'http://colormind.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/colormind/, '/api/'),
      },
    },
  },
});

