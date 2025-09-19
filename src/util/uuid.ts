// biome-ignore-all lint/suspicious/noBitwiseOperators: This contains some proper bitwise logic
// biome-ignore-all lint/style/noMagicNumbers: It's ok here; this is concise code serving a well known random function

// Source: https://gist.github.com/jed/982883
export function uuid(a?: number): string {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : // @ts-ignore
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}
