import { AxiosError } from 'axios';
import { delay } from './delay';
import { BskyError } from './error';

function calculateDelay(iteration: number, baseDelay = 1000) {
  // (b * 2 ^ n) + (0..1 * n * 1000):
  // b - base delay
  // n - iteration number
  // 0..1 - random number from 0 to 1
  // 1000 - 1 second
  // Examples:
  // 1. (1000 * 2 ^ 0) + (0.5 * 0 * 1000) = 1000 (1 second)
  // 2. (1000 * 2 ^ 1) + (0.5 * 1 * 1000) = 2500 (2.5 seconds)
  // 3. (1000 * 2 ^ 2) + (0.5 * 2 * 1000) = 5000 (5 seconds)
  // 4. (1000 * 2 ^ 3) + (0.5 * 3 * 1000) = 9500 (9.5 seconds)
  // 5. (1000 * 2 ^ 4) + (0.5 * 4 * 1000) = 18000 (18 seconds)
  // ...
  // 10. (1000 * 2 ^ 9) + (0.5 * 9 * 1000) = 516500 (8.6 minutes)
  // ...
  // 15. (1000 * 2 ^ 14) + (0.5 * 14 * 1000) = 16391000 (4.6 hours)
  return baseDelay * 2 ** iteration + Math.random() * 1000 * iteration;
}

export function Retry(
  target: any,
  key: string,
  descriptor: PropertyDescriptor & any,
) {
  const retryCount = 15;
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    let lastError: unknown;

    for (let i = 0; i <= retryCount; i++) {
      // If there is a delay promise, wait for it to resolve before retrying
      if (this.delayPromise) {
        console.log('Waiting for delay promise to resolve');
        await this.delayPromise;
        this.delayPromise = undefined;
      }

      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const axiosError = new BskyError(error);
        lastError = axiosError;

        // Authentificate and retry request again
        if (axiosError.status === 401) {
          try {
            await this.createSession();
          } catch (sessionError) {
            const _sessionError = new BskyError(sessionError, i);
            console.error('Error session: ', _sessionError);
            throw _sessionError;
          }
          continue;
        }

        // If there is a delay promise, continue to the next iteration and wait for it to resolve
        if (this.delayPromise) {
          continue;
        }

        const delayValue = calculateDelay(i);
        const delaySeconds = Math.floor(delayValue / 1000);
        console.log(`Rate limit hit. Retrying after delay ${delaySeconds}s`);
        this.delayPromise = delay(delayValue);

        console.log('Error: ', axiosError);
      }
    }
    throw lastError;
  };
}
