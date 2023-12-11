/**
 * PromisePool is a utility class that allows you to limit the number of concurrent promises.
 */
export class PromisePool {
  private readonly concurrency: number;
  private items: Set<Promise<void>> = new Set();

  constructor(options: { concurrency: number }) {
    this.concurrency = options.concurrency;
  }

  async add(func: () => Promise<void>): Promise<void> {
    if (this.items.size >= this.concurrency) {
      // halt execution until fastest promise fulfills
      await Promise.race(this.items);
    }

    const promise = func();

    promise.finally(() => {
      this.items.delete(promise);
    });

    this.items.add(promise);
  }
}
