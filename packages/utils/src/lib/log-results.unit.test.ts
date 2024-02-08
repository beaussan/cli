import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileResult } from './file-system';
import { logMultipleResults, logPromiseResults } from './log-results';
import { ui } from './logging';

describe('logMultipleResults', () => {
  const succeededCallbackMock = vi.fn();
  const failedCallbackMock = vi.fn();

  it('should call logPromiseResults with successfull plugin result', () => {
    logMultipleResults(
      [
        {
          status: 'fulfilled',
          value: ['out.json', 10_000],
        } as PromiseFulfilledResult<FileResult>,
      ],
      'Generated reports',
      succeededCallbackMock,
      failedCallbackMock,
    );

    expect(succeededCallbackMock).toHaveBeenCalled();
    expect(failedCallbackMock).not.toHaveBeenCalled();
  });

  it('should call logPromiseResults with failed plugin result', () => {
    logMultipleResults(
      [{ status: 'rejected', reason: 'fail' } as PromiseRejectedResult],
      'Generated reports',
      succeededCallbackMock,
      failedCallbackMock,
    );

    expect(failedCallbackMock).toHaveBeenCalled();
    expect(succeededCallbackMock).not.toHaveBeenCalled();
  });

  it('should call logPromiseResults twice', () => {
    logMultipleResults(
      [
        {
          status: 'fulfilled',
          value: ['out.json', 10_000],
        } as PromiseFulfilledResult<FileResult>,
        { status: 'rejected', reason: 'fail' } as PromiseRejectedResult,
      ],
      'Generated reports',
      succeededCallbackMock,
      failedCallbackMock,
    );

    expect(succeededCallbackMock).toHaveBeenCalledOnce();
    expect(failedCallbackMock).toHaveBeenCalledOnce();
  });
});

describe('logPromiseResults', () => {
  beforeAll(() => {
    ui().switchMode('raw');
  });

  afterEach(() => {
    ui().flushLogs();
  });

  it('should log on success', () => {
    logPromiseResults(
      [
        {
          status: 'fulfilled',
          value: ['out.json'],
        } as PromiseFulfilledResult<FileResult>,
      ],
      'Uploaded reports successfully:',
      (result): string => result.value.toString(),
    );
    const logs = ui()
      .logger.getRenderer()
      .getLogs()
      .map(({ message }) => message);
    expect(logs[0]).toBe('[ blue(info) ] Uploaded reports successfully:');
    expect(logs[1]).toBe('[ blue(info) ] out.json');
  });

  it('should log on fail', () => {
    logPromiseResults(
      [{ status: 'rejected', reason: 'fail' } as PromiseRejectedResult],
      'Generated reports failed:',
      (result: { reason: string }) => result.reason.toString(),
    );
    const logs = ui()
      .logger.getRenderer()
      .getLogs()
      .map(({ message }) => message);
    expect(logs[0]).toBe('[ yellow(warn) ] Generated reports failed:');
    expect(logs[1]).toBe('[ yellow(warn) ] fail');
  });
});
