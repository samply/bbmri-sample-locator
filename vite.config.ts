import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		include: ['@samply/lens'], // Make sure the package is correctly included
	},
	ssr: {
		noExternal: ['@samply/lens'], // Mark package as noExternal if SSR issues
	},

});
