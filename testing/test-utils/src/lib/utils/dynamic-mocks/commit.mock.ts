import type { Commit } from '@code-pushup/models';

export const COMMIT_MOCK: Commit = {
  hash: 'abcdef0123456789abcdef0123456789abcdef01',
  message: 'Minor fixes',
  author: 'John Doe',
  date: new Date('2023-08-16T08:30:00.000Z'),
};
