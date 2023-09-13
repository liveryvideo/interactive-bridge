import { test } from 'vitest';
import { PlaybackModeParser } from '../../src/Parser/PlaybackModeParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new PlaybackModeParser());

test('given value, yields response', () => {
  tester.assertValueYieldsSameAsResult('CATCHUP');
  tester.assertValueYieldsSameAsResult('LIVE');
  tester.assertValueYieldsSameAsResult('UNKNOWN');
  tester.assertValueYieldsSameAsResult('VOD');
});

test('given invalid value, throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('OTHER');
  tester.assertValueThrowsInvalidTypeError('live');
});
