import { test } from 'vitest';
import { OrientationParser } from '../../src/InteractiveBridge/OrientationParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new OrientationParser());

test('given value, yields response', () => {
  tester.assertValueYieldsSameAsResult('landscape');
  tester.assertValueYieldsSameAsResult('portrait');
});

test('given invalid value, throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError(true);
  tester.assertValueThrowsInvalidTypeError(false);
  tester.assertValueThrowsInvalidTypeError('garbage');
  tester.assertValueThrowsInvalidTypeError('LANDSCAPE');
  tester.assertValueThrowsInvalidTypeError({});
  tester.assertValueThrowsInvalidTypeError([]);
});
