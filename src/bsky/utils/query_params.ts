import { URLSearchParams } from 'node:url';

export function queryParams(queryObj: Record<string, any>): string {
  let params: any = new URLSearchParams(queryObj);
  params = params.toString();
  params = params.length ? '?' + params : '';
  return params;
}
