import { test } from 'vitest';
import { StreamPhaseParser } from '../../src/Parser/StreamPhaseParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new StreamPhaseParser());

test('given value, yields response', () => {
  tester.assertValueYieldsResult('PRE', 'PRE');
  tester.assertValueYieldsResult('LIVE', 'LIVE');
  tester.assertValueYieldsResult('POST', 'POST');
});

test('given invalid value, command subscribeStreamPhase throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('OTHER');
  tester.assertValueThrowsInvalidTypeError('live');
});
