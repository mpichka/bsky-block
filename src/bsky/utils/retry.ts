import { delay } from './delay';
import { BskyError } from './error';

export function Retry(
  target: any,
  key: string,
  descriptor: PropertyDescriptor & any,
) {
  const method = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args);
    } catch (error: any) {
      delay(5000);
      const axiosError = new BskyError(error);
      console.error('Error: ', axiosError);
      try {
        await this.createSession();
        return await method.apply(this, args);
      } catch (retryError: any) {
        const retryAxiosError = new BskyError(retryError);
        console.error('Retry error:', retryAxiosError);
      }
    }
  };
}
