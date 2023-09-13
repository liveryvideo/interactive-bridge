import { test } from 'vitest';
import { PlaybackStateParser } from '../../src/InteractiveBridge/PlaybackStateParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new PlaybackStateParser());

test('given value, yields response', () => {
  tester.assertValueYieldsSameAsResult('BUFFERING');
  tester.assertValueYieldsSameAsResult('ENDED');
  tester.assertValueYieldsSameAsResult('FAST_FORWARD');
  tester.assertValueYieldsSameAsResult('PAUSED');
  tester.assertValueYieldsSameAsResult('PLAYING');
  tester.assertValueYieldsSameAsResult('REWIND');
  tester.assertValueYieldsSameAsResult('SEEKING');
  tester.assertValueYieldsSameAsResult('SLOW_MO');
});

test('given invalid value, throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('OTHER');
  tester.assertValueThrowsInvalidTypeError('live');
});
