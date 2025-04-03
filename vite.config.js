import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            '@/Layouts': '/resources/js/Layouts',
            '@/Pages': '/resources/js/Pages',
            '@/Components': '/resources/js/Components',
            '@/components': '/resources/js/Components',
        },
    },
    define: {
        'process.env': {},
    },
});
 