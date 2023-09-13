import { describe, test } from 'vitest';
import type { Controls } from '../../src/Parser/ControlsParser';
import { ControlsParser } from '../../src/Parser/ControlsParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const allFalse: Controls = {
  cast: false,
  contact: false,
  error: false,
  fullscreen: false,
  mute: false,
  pip: false,
  play: false,
  quality: false,
  scrubber: false,
};

const allTrue: Controls = {
  cast: true,
  contact: true,
  error: true,
  fullscreen: true,
  mute: true,
  pip: true,
  play: true,
  quality: true,
  scrubber: true,
};

const tester = new ParserTestApparatus(new ControlsParser());

describe('given value, yields result', () => {
  test('all false', () => {
    tester.assertValueYieldsResult({ ...allFalse }, { ...allFalse });
  });

  test('all true', () => {
    tester.assertValueYieldsResult({ ...allTrue }, { ...allTrue });
  });

  test('absent fields parse to false', () => {
    tester.assertValueYieldsResult({}, { ...allFalse });
  });

  test('non true values parse to false', () => {
    tester.assertValueYieldsResult(
      { ...allTrue, play: 1 },
      { ...allTrue, play: false },
    );
    tester.assertValueYieldsResult(
      { ...allTrue, play: 'unexpected' },
      { ...allTrue, play: false },
    );
    tester.assertValueYieldsResult(
      { ...allTrue, mute: 1 },
      { ...allTrue, mute: false },
    );
    tester.assertValueYieldsResult(
      { ...allTrue, mute: 'unexpected' },
      { ...allTrue, mute: false },
    );
  });

  test('unrecognized fields are stripped', () => {
    tester.assertValueYieldsResult(
      { ...allTrue, garbage: true },
      { ...allTrue },
    );
  });
});

test('given invalid value throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(0);
  tester.assertValueThrowsInvalidTypeError(1);
  tester.assertValueThrowsInvalidTypeError('garbage');
  tester.assertValueThrowsInvalidTypeError([]);
});
