import { EOL } from 'node:os';
import type { PackageJson, SHEBANG } from 'js-utils-kit';

type Shebang = (typeof SHEBANG)[keyof typeof SHEBANG];

type PackageMeta = Pick<
  PackageJson,
  | 'name'
  | 'displayName'
  | 'version'
  | 'description'
  | 'author'
  | 'license'
  | 'homepage'
  | 'repository'
>;

/**
 * Generate a production banner comment from package metadata.
 *
 * @remarks
 * This utility creates a formatted banner typically used at the top of bundled files (e.g., Rollup, tsdown, esbuild, webpack outputs).
 *
 * The banner includes:
 * - Package name or display name
 * - Version (with optional prefix)
 * - Description
 * - Copyright
 * - License
 * - Homepage
 * - Repository URL
 *
 * Repository URLs are normalized by removing common prefixes such as `git+` and suffixes like `.git`.
 *
 * @returns A formatted banner string suitable for insertion at the top of bundled files.
 *
 * @throws {TypeError} Thrown if the provided `pkg` value is not a valid object.
 *
 * @example Basic usage
 * ```ts
 * import pkg from "../package.json";
 *
 * const text = banner({ pkg });
 * console.log(text);
 * ```
 *
 * @example With shebang for CLI tools
 * ```ts
 * const text = banner({
 *   pkg,
 *   shebang: "#!/usr/bin/env node"
 * });
 * ```
 *
 * @example Using display name
 * ```ts
 * const text = banner({
 *   pkg,
 *   useDisplayName: true
 * });
 * ```
 */
export function banner({
  pkg,
  shebang = false,
  style = 'js',
  useDisplayName = false,
  prefixVersion = 'v',
  fallback = {
    name: 'unknown',
    version: '0.0.0',
  },
}: {
  /** Package metadata used to construct the banner */
  pkg: PackageMeta;
  /**
   * Optional shebang line (for CLI binaries).
   *
   * @default false
   */
  shebang?: Shebang | false;
  /**
   * Banner comment style.
   *
   * Currently supports:
   * - `js`
   *
   * @default "js"
   */
  style?: 'js';
  /** Prefer `displayName` over `name` when available */
  useDisplayName?: boolean;
  /**
   * Prefix applied before the version.
   *
   * @default "v"
   */
  prefixVersion?: string;
  /** Fallback values when `name` or `version` are missing */
  fallback?: {
    name?: string;
    version?: string;
  };
}) {
  if (!pkg || typeof pkg !== 'object') {
    throw new TypeError('Expected valid metadata');
  }

  let res = '';
  const lines: string[] = [];
  const year = new Date().getFullYear();
  const REPO_REPLACE = /^(git\+)|(\.git)$/g;

  if (shebang) res += shebang + EOL.repeat(2);

  lines.push(
    `${(useDisplayName ? pkg.displayName : pkg.name) ?? fallback.name} ${prefixVersion}${pkg.version ?? fallback.version}`,
  );
  lines.push(pkg.description ?? '');
  lines.push('');
  lines.push(
    `(c) ${year} ${(typeof pkg.author === 'object' ? pkg.author.name : pkg.author) ?? ''}`,
  );
  if (pkg.license) lines.push(`Released under the ${pkg.license} License`);
  lines.push('');

  const homepage = pkg.homepage;
  if (homepage) lines.push(homepage);

  const repo =
    typeof pkg.repository === 'object'
      ? pkg.repository.url?.replace(REPO_REPLACE, '')
      : pkg.repository?.replace(REPO_REPLACE, '');
  if (repo) lines.push(repo);

  switch (style) {
    case 'js':
      res += [
        '/*!',
        ...lines.slice(0, lines.findLastIndex((l) => l !== '') + 1).map((l) => ` * ${l}`),
        ' */',
      ].join(EOL);
      break;
  }

  return res;
}
