import part01Review from './part-01.js';
import part02Review from './part-02.js';
import part03Review from './part-03.js';
import part04Review from './part-04.js';
import part05Review from './part-05.js';

export const partReviews = {
  1: part01Review,
  2: part02Review,
  3: part03Review,
  4: part04Review,
  5: part05Review
};

export const getPartReview = (partId) => partReviews[partId] || null;
