import isaacs_cliui from '@isaacs/cliui';
import { cliui } from '@poppinss/cliui';
import chalk from 'chalk';
import { TERMINAL_WIDTH } from './reports/constants';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;
export type CliUiBase = ReturnType<typeof cliui>;
type UI = ReturnType<typeof isaacs_cliui>;
type CliExtension = {
  row: (r: ArgumentsType<UI['div']>) => void;
  flushLogs: () => void;
};
export type Column = {
  text: string;
  width?: number;
  align?: 'right' | 'left' | 'center';
  padding: number[];
  border?: boolean;
};
export type CliUi = CliUiBase & CliExtension;

// eslint-disable-next-line import/no-mutable-exports,functional/no-let
export let singletonUiInstance: CliUiBase | undefined;

export function ui(): CliUi {
  if (singletonUiInstance === undefined) {
    singletonUiInstance = cliui();
  }
  return {
    ...singletonUiInstance,
    flushLogs: () => {
      const logs = singletonUiInstance?.logger.getRenderer().getLogs();
      // mutate internal array as there is no public API to reset the internal logs array.
      // if we don't do it we carry items from across tests
      // eslint-disable-next-line functional/immutable-data
      logs?.splice(0, logs.length);
    },
    row: args => {
      logListItem(args);
    },
  };
}

// eslint-disable-next-line functional/no-let
let singletonisaacUi: UI | undefined;
export function logListItem(args: ArgumentsType<UI['div']>) {
  if (singletonisaacUi === undefined) {
    singletonisaacUi = isaacs_cliui({ width: TERMINAL_WIDTH });
  }
  singletonisaacUi.div(...args);
  const content = singletonisaacUi.toString();
  // eslint-disable-next-line functional/immutable-data
  singletonisaacUi.rows = [];
  singletonUiInstance?.logger.log(content);
}

export function link(text: string) {
  return chalk.underline(chalk.blueBright(text));
}
