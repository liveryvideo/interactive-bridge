import { isSemVerCompatible } from './semver';

// TODO: Just perform this version compatibility test once within /index.ts and define elements there?

const version = __VERSION__;

export function defineVersionedElement(
  name: string,
  Class: typeof HTMLElement & { version: string },
) {
  const defined = customElements.get(name);
  if (defined) {
    if (!('version' in defined)) {
      throw new Error(
        `Previously defined element: ${name} has no version property`,
      );
    }

    const { version: otherVersion } = defined;
    if (typeof otherVersion !== 'string') {
      throw new Error(
        `Previously defined element: ${name}'s version property is not a string`,
      );
    }

    const compatible = isSemVerCompatible(otherVersion, version);
    if (!compatible) {
      throw new Error(
        `Previously defined element: ${name}'s version: ${otherVersion} is incompatible with ours: ${version}`,
      );
    }

    // TODO: Log versions?

    return;
  }

  customElements.define(name, Class);
}
