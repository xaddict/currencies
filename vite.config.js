import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import crypto from 'crypto';

export default defineConfig(({ mode }) => {
	// Generate a random UUID to serve as a unique cache version
	const buildId = crypto.randomUUID();

	return {
		plugins: [
			VitePWA({
				srcDir: '.',
				filename: 'service-worker.js',
				strategies: 'injectManifest',
			})
		],
		define: {
			__BUILD_VERSION__: JSON.stringify(buildId)
		}
	}
});
