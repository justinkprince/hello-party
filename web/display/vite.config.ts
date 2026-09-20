// Phase 0 spike config. UNVERIFIED until run.
// The small plugin below receives the spike's result (POST /__spike-result), prints it in the
// terminal that runs Vite, and appends it to spike-results.log (gitignored via *.log).
import { defineConfig, type Plugin } from 'vite';
import { appendFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

function spikeResults(): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/__spike-result' || req.method !== 'POST') return next();
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      console.log('\n[spike result]\n' + body + '\n');
      try {
        appendFileSync('spike-results.log', body + '\n');
      } catch {
        // logging to a file is optional
      }
      res.statusCode = 204;
      res.end();
    });
  };
  return {
    name: 'spike-results',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

// Phase 1 (D-36, D-42): the character code and parts live outside this folder (shared/, assets/), so the dev
// server may read the repo root, and the build has a second page, gallery.html. UNVERIFIED until run.
export default defineConfig({
  plugins: [spikeResults()],
  // host: true listens on the LAN so the Mac can open http://hello-party.local:PORT.
  server: { host: true, allowedHosts: ['hello-party.local'], fs: { allow: ['../..'] } },
  preview: { host: true, allowedHosts: ['hello-party.local'] },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        gallery: fileURLToPath(new URL('./gallery.html', import.meta.url)),
      },
    },
  },
});
