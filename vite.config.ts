import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify("https://nounopzfgcfbzpvbkcow.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdW5vcHpmZ2NmYnpwdmJrY293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2Mzg1MjQsImV4cCI6MjA4NzIxNDUyNH0.Y5f7Hde57d_zUNBgWNA6duZJ16jX7EYCvRaSUKEYcQA"),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify("nounopzfgcfbzpvbkcow"),
  },
  build: {
    sourcemap: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
