import { test } from 'vitest';
import { QualitiesParser } from '../../src/Parser/QualitiesParser';
import { ParserTestApparatus } from '../utils/ParserTestApparatus';

const tester = new ParserTestApparatus(new QualitiesParser());

const lowQuality = {
  audio: {
    bandwidth: 24000,
  },
  label: '270p',
  video: {
    bandwidth: 500000,
    height: 270,
    width: 480,
  },
};

const medQuality = {
  audio: {
    bandwidth: 96000,
  },
  label: '720p',
  video: {
    bandwidth: 3000000,
    height: 720,
    width: 1280,
  },
};

test('given value, yields result', () => {
  tester.assertValueYieldsResult([], []);
  tester.assertValueYieldsResult([lowQuality], [{ ...lowQuality, index: 0 }]);
  tester.assertValueYieldsResult(
    [lowQuality, medQuality],
    [
      { ...lowQuality, index: 0 },
      { ...medQuality, index: 1 },
    ],
  );
});

test('malformed entries are sanitized where possible', () => {
  tester.assertValueYieldsResult(['garbage'], [{ label: '0', index: 0 }]);
  tester.assertValueYieldsResult([undefined], []);
  tester.assertValueYieldsResult([null], [{ label: '0', index: 0 }]);
});

test('sparse arrays are compacted', () => {
  tester.assertValueYieldsResult(
    [undefined, lowQuality],
    [{ ...lowQuality, index: 1 }],
  );
  tester.assertValueYieldsResult(
    [undefined, 'garbage'],
    [{ label: '1', index: 1 }],
  );
  tester.assertValueYieldsResult(
    [undefined, 'garbage', undefined, lowQuality],
    [
      { label: '1', index: 1 },
      { ...lowQuality, index: 3 },
    ],
  );
});

test('index on response object is overwritten with actual index', () => {
  tester.assertValueYieldsResult(
    [
      { ...lowQuality, index: 501 },
      { ...lowQuality, index: NaN },
    ],
    [
      { ...lowQuality, index: 0 },
      { ...lowQuality, index: 1 },
    ],
  );
});

test('if no label given, stringified index is used', () => {
  const myQuality: Record<string, unknown> = { ...lowQuality };
  delete myQuality.label;
  tester.assertValueYieldsResult(
    [myQuality],
    [{ ...myQuality, index: 0, label: '0' }],
  );
});

test('given invalid value, throws InvalidTypeError', () => {
  tester.assertValueThrowsInvalidTypeError(null);
  tester.assertValueThrowsInvalidTypeError(undefined);
  tester.assertValueThrowsInvalidTypeError(720);
  tester.assertValueThrowsInvalidTypeError('1080p');
  tester.assertValueThrowsInvalidTypeError({});
});
