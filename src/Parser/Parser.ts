export interface Parser<OutType> {
  parse: (value: unknown) => OutType;
}
