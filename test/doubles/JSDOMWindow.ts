/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsdom from 'jsdom';

export function createJSDOMWindow(url?: string): Window {
  const { window } = new jsdom.JSDOM('<!DOCTYPE html>', { url });
  return window as Window;
}
