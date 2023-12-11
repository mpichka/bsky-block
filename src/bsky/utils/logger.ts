import clc from 'cli-color';
import { DateTime } from 'luxon';

export function Logger(
  target: any,
  key: string,
  descriptor: PropertyDescriptor & any,
) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (!this.logger) return method.apply(this, args);

    const start = DateTime.now().toMillis();
    const res = method.apply(this, args);
    const end = DateTime.now().toMillis();
    console.log(
      `${clc.cyan('[BskyClient]')} - ${key} ${clc.yellow(
        `(${end - start}ms)`,
      )}`,
    );
    return res;
  };
}
