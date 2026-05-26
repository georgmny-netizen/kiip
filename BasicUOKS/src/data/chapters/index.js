// Агрегатор всех глав — lazy loading через динамические импорты.
// Каждый файл главы загружается только при первом обращении к ней.

const cache = {};

export const chaptersData = cache;

const loaders = {
  1:  () => import('./chapter-01.js'),
  2:  () => import('./chapter-02.js'),
  3:  () => import('./chapter-03.js'),
  4:  () => import('./chapter-04.js'),
  5:  () => import('./chapter-05.js'),
  6:  () => import('./chapter-06.js'),
  7:  () => import('./chapter-07.js'),
  8:  () => import('./chapter-08.js'),
  9:  () => import('./chapter-09.js'),
  10: () => import('./chapter-10.js'),
  11: () => import('./chapter-11.js'),
  12: () => import('./chapter-12.js'),
  13: () => import('./chapter-13.js'),
  14: () => import('./chapter-14.js'),
  15: () => import('./chapter-15.js'),
  16: () => import('./chapter-16.js'),
  17: () => import('./chapter-17.js'),
  18: () => import('./chapter-18.js'),
  19: () => import('./chapter-19.js'),
  20: () => import('./chapter-20.js'),
  21: () => import('./chapter-21.js'),
  22: () => import('./chapter-22.js'),
  23: () => import('./chapter-23.js'),
  24: () => import('./chapter-24.js'),
  25: () => import('./chapter-25.js'),
  26: () => import('./chapter-26.js'),
  27: () => import('./chapter-27.js'),
  28: () => import('./chapter-28.js'),
  29: () => import('./chapter-29.js'),
  30: () => import('./chapter-30.js'),
  31: () => import('./chapter-31.js'),
  32: () => import('./chapter-32.js'),
  33: () => import('./chapter-33.js'),
  34: () => import('./chapter-34.js'),
  35: () => import('./chapter-35.js'),
  36: () => import('./chapter-36.js'),
  37: () => import('./chapter-37.js'),
  38: () => import('./chapter-38.js'),
  39: () => import('./chapter-39.js'),
  40: () => import('./chapter-40.js'),
  41: () => import('./chapter-41.js'),
  42: () => import('./chapter-42.js'),
  43: () => import('./chapter-43.js'),
  44: () => import('./chapter-44.js'),
  45: () => import('./chapter-45.js'),
  46: () => import('./chapter-46.js'),
  47: () => import('./chapter-47.js'),
  48: () => import('./chapter-48.js'),
  49: () => import('./chapter-49.js'),
  50: () => import('./chapter-50.js'),
};

export const getChapter = async (n) => {
  if (cache[n]) return cache[n];
  const loader = loaders[n];
  if (!loader) return null;
  const mod = await loader();
  cache[n] = mod.default;
  return cache[n];
};
