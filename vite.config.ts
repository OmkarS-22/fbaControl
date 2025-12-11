// import path from 'path';
// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, '.', '');
//   return {
//     server: {
//       port: 3000,
//       host: '0.0.0.0',
//     },
//     plugins: [react()],
//     define: {
//       'process.env.REAL_API_KEY': JSON.stringify(env.REAL_API_KEY),
//       'process.env.REAL_API_URL': JSON.stringify(env.REAL_API_URL)

//     },
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, '.'),
//       }
//     }
//   };
// });

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
