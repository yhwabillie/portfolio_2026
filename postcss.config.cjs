// postcss.config.js
module.exports = {
  plugins: {
    // 구형 브라우저에서도 CSS3 속성이 돌아가게 벤더 프리픽스(-webkit- 등) 자동 추가
    autoprefixer: {},
  },
};
