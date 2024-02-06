import { afterEach, beforeAll, expect } from 'vitest';
import { makeStatusClean, makeStatusDirty } from '@code-pushup/testing-utils';
import {
  branchHasChanges,
  getCurrentBranchOrTag,
  getLatestCommit,
  git,
  guardAgainstLocalChanges,
  safeCheckout,
} from './git';

const gitCommitDateRegex =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{2}:\d{2}:\d{2} \d{4} [+|-]\d{4}$/;

describe('getLatestCommit', () => {
  afterEach(async () => {
    await makeStatusClean();
  });
  it('should log latest commit', async () => {
    await expect(getLatestCommit()).resolves.toEqual(
      expect.objectContaining({
        hash: expect.stringMatching(/^[\da-f]{40}$/),
        message: expect.stringMatching(/.+/),
        author: expect.stringMatching(/.+/),
        date: expect.stringMatching(gitCommitDateRegex),
      }),
    );
  });
});

describe('branchHasChanges', () => {
  it('should return true if some changes are given', async () => {
    await makeStatusDirty();
    await expect(branchHasChanges()).resolves.toBe(true);
  });

  it('should return false if no changes are given', async () => {
    await expect(branchHasChanges()).resolves.toBe(false);
  });
});

describe('guardAgainstLocalChanges', () => {
  it('should throw if history is dirty', async () => {
    await makeStatusDirty();
    await expect(guardAgainstLocalChanges()).rejects.toThrow(
      'Working directory needs to be clean before we you can proceed. Commit your local changes or stash them.',
    );
  });

  it('should not throw if history is clean', async () => {
    await expect(guardAgainstLocalChanges()).resolves.toBeUndefined();
  });
});

describe('getCurrentBranchOrTag', () => {
  it('should log current branch', async () => {
    await expect(getCurrentBranchOrTag()).resolves.toEqual(expect.any(String));
  });
});

describe('safeCheckout', () => {
  let initialBranch: string;

  beforeAll(async () => {
    initialBranch = await getCurrentBranchOrTag();
  });

  afterEach(async () => {
    await git.checkout(initialBranch);
    await makeStatusClean();
  });

  it('should checkout target branch in clean state', async () => {
    await expect(safeCheckout('main')).resolves.toBeUndefined();
    await expect(getCurrentBranchOrTag()).resolves.toBe('main');
  });

  it('should throw if history is dirty', async () => {
    await makeStatusDirty();
    await expect(safeCheckout('main')).rejects.toThrow(
      'Working directory needs to be clean before we you can proceed. Commit your local changes or stash them.',
    );
  });

  it('should clean local changes and check out to main', async () => {
    await makeStatusDirty();
    await expect(
      safeCheckout('main', { clean: true }),
    ).resolves.toBeUndefined();
    await expect(getCurrentBranchOrTag()).resolves.toBe('main');
  });
});
