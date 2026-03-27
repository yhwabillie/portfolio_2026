import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        loadPaths: [path.resolve(__dirname, "src")],
        additionalData: (content, filepath) => {
          if (filepath.replace(/\\/g, "/").includes("styles/utils")) return content;
          return `@use "styles/utils" as *; \n` + content;
        },
      },
    },
    devSourcemap: true,
  },
  build: {
    // CSS 파일 분할 (CSS를 하나의 큰 파일이 아닌 의미 있는 단위로 나눔)
    cssCodeSplit: true,
    // 리소스를 인라인으로 넣을지 결정하는 기준 (kb 단위)
    // 4kb 미만의 작은 에셋은 별도 파일 대신 Base64 문자열로 CSS에 직접 삽입하여 요청 수 절감
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        // 빌드된 파일 이름에 해시값을 붙여 브라우저 캐싱 효율화
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split(".").at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    // CSS 압축 설정 (기본값은 esbuild이며 매우 빠르고 강력함)
    minify: "esbuild",
  },
});
