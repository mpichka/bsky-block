export class BskyError {
  message?: string;
  name?: string;
  code?: string;
  status?: number;
  data?: string;

  constructor(error: any) {
    this.message = error?.message;
    this.name = error?.name;
    this.code = error?.code;
    this.status = error?.response?.status;
    this.data = error?.response?.data;
  }
}
