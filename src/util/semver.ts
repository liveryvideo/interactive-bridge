// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function semver(version: string) {
  const matches = regex.exec(version);
  if (!matches) {
    throw new Error(`Invalid semantic version: ${version}`);
  }
  const [major, minor, patch, prerelease, buildmetadata] = matches;
  return { major, minor, patch, prerelease, buildmetadata };
}

export function isSemVerCompatible(v1: string, v2: string) {
  const { major: major1, minor: minor1 } = semver(v1);
  const { major: major2, minor: minor2 } = semver(v2);
  const compat1 = major1 === '0' ? `${major1}.${minor1}` : major1;
  const compat2 = major2 === '0' ? `${major2}.${minor2}` : major2;
  return compat1 === compat2;
}
