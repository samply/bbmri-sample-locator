import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		exclude: ['@samply/lens'], // Ensure local linking works
	},
	ssr: {
		noExternal: ['@samply/lens'], // Mark package as noExternal if SSR issues
	}
});
