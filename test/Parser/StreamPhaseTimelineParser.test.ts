import { test } from 'vitest';
import { StreamPhaseTimelineParser } from '../../src/Parser/StreamPhaseTimelineParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new StreamPhaseTimelineParser());

test('given value, yields response', () => {
  tester.assertValueYieldsResult({}, {});
  tester.assertValueYieldsResult({ garbage: 'LIVE' }, {});
  tester.assertValueYieldsResult(
    { 0: 'LIVE', 1: 'POST', 2: 'PRE' },
    { 0: 'LIVE', 1: 'POST', 2: 'PRE' },
  );
  tester.assertValueYieldsResult(
    { 1.2121212121: 'PRE' },
    { 1.2121212121: 'PRE' },
  );
  tester.assertValueYieldsResult({ 0: 'PRE', garbage: 'LIVE' }, { 0: 'PRE' });
  tester.assertValueYieldsResult({ 0: 'PRE', 1: 'garbage' }, { 0: 'PRE' });
  tester.assertValueYieldsResult(
    { 0: 'LIVE', 1: 'LIVE' },
    { 0: 'LIVE', 1: 'LIVE' },
  );
});

test('given invalid value, command subscribeStreamPhaseTimeline throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('string');
  tester.assertValueThrowsInvalidTypeError([]);
});
