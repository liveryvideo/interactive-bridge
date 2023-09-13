import { test } from 'vitest';
import { BooleanParser } from '../../src/InteractiveBridge/BooleanParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new BooleanParser('test'));

test('given value, yields result', () => {
  tester.assertValueYieldsSameAsResult(true);
  tester.assertValueYieldsSameAsResult(false);
});

test('given invalid value throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('garbage');
  tester.assertValueThrowsInvalidTypeError({});
  tester.assertValueThrowsInvalidTypeError([]);
});
