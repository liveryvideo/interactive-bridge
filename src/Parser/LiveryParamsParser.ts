import type { Parser } from './Parser';

export class LiveryParamsParser implements Parser<Record<string, string>> {
  parse(value: unknown) {
    if (typeof value !== 'object') {
      throw new Error(
        `getLiveryParams value type: ${typeof value}, should be: object`,
      );
    }
    if (value === null) {
      throw new Error(`getLiveryParams value type: null, should be: object`);
    }
    const dict: Record<string, string> = {};
    for (const [paramKey, paramValue] of Object.entries(value)) {
      if (typeof paramValue === 'string') {
        dict[paramKey] = paramValue;
      }
    }
    return dict;
  }
}
