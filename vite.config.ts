import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Bundle analyzer - generates stats.html in dist folder
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    hmr: {
      timeout: 120000
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI components
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          
          // State management
          query: ['@tanstack/react-query'],
          
          // Capacitor and Firebase
          capacitor: ['@capacitor/core', '@capacitor/app', '@capacitor/preferences'],
          firebase: [
            '@capacitor-firebase/app',
            '@capacitor-firebase/messaging',
            '@capacitor-firebase/crashlytics'
          ],
          
          // AWS SDK
          aws: ['@aws-sdk/client-s3', '@aws-sdk/lib-storage'],
          
          // Utilities
          utils: ['date-fns', 'axios', 'uuid', 'clsx', 'tailwind-merge'],
          
          // Icons and animations
          icons: ['lucide-react', 'framer-motion'],
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[jt]sx?$/, '') 
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // Treat these as external dependencies (don't bundle them)
      external: [],
      
      // Configure tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.trace'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'date-fns',
      'uuid',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor-firebase/app',
      '@capacitor-firebase/messaging',
      '@capacitor-firebase/crashlytics'
    ]
  },
  
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Performance optimizations
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable minify identifiers
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    // Enable minify syntax
    minifySyntax: process.env.NODE_ENV === 'production',
    // Enable minify whitespace
    minifyWhitespace: process.env.NODE_ENV === 'production',
  }
});
