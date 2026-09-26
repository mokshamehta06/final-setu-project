const { defineConfig } = require("vite")

module.exports = defineConfig({
  publicDir: false,
  build: { outDir: "dist", emptyOutDir: true, manifest: true },
})