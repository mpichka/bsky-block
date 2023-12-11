export function CheckSession(
  target: any,
  key: string,
  descriptor: PropertyDescriptor & any,
) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (!this.accessToken || !this.refreshToken || !this.baseUrl) {
      throw new Error('Session is not set');
    }
    return method.apply(this, args);
  };
}
