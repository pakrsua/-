import { atom } from 'recoil';

export const categoryLState = atom({
  key: 'categoryLState',
  default: '추천',
});

export const categoryClickState = atom({
  key: 'categoryClickState',
  default: '2',
});

export const categorySIdState = atom({
  key: 'categorySIdState',
  default: 2,
});
