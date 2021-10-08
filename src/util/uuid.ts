// Note: This is a copy from https://github.com/liveryvideo/player-web

// Source: https://gist.github.com/jed/982883
export function uuid(a?: number): string {
  /* eslint-disable */
  // prettier-ignore
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    // @ts-ignore
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
  /* eslint-enable */
}
