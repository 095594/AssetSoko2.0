import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    input: [
        'resources/js/app.jsx',
        'resources/css/app.css', // Include CSS if necessary
    ],
    
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            '@/Layouts': '/resources/js/Layouts', // Add this line
        },
    },
    plugins: [react()],
    define: {
      'process.env': {},
    },
  
});
 