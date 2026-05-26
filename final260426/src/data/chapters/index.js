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
};

export const getChapter = async (n) => {
  if (cache[n]) return cache[n];
  const loader = loaders[n];
  if (!loader) return null;
  const mod = await loader();
  cache[n] = mod.default;
  return cache[n];
};
