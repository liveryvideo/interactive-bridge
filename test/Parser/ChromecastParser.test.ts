import { test } from 'vitest';
import { ChromecastParser } from '../../src/Parser/ChromecastParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new ChromecastParser());

test('given value, yields result', () => {
  tester.assertValueYieldsSameAsResult('');
  tester.assertValueYieldsSameAsResult(undefined);
  tester.assertValueYieldsSameAsResult('arbitrary string');
  tester.assertValueYieldsSameAsResult('special\ncharacter');
});

test('given invalid value throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError(true);
  tester.assertValueThrowsInvalidTypeError(false);
  tester.assertValueThrowsInvalidTypeError({});
  tester.assertValueThrowsInvalidTypeError([]);
});
