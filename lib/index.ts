import { EOL } from 'node:os';
import figlet from 'figlet';
import type { PackageJson, SHEBANG } from 'js-utils-kit';
import colors from 'use-colors';

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

type FontName =
  | '1Row'
  | '3-D'
  | '3D Diagonal'
  | '3D-ASCII'
  | '3x5'
  | '4Max'
  | '5 Line Oblique'
  | 'Standard'
  | 'Ghost'
  | 'Big'
  | 'Block'
  | 'Bubble'
  | 'Digital'
  | 'Ivrit'
  | 'Mini'
  | 'Script'
  | 'Shadow'
  | 'Slant'
  | 'Small'
  | 'Speed'
  | 'Tinker-Toy';

/**
 * Prints a stylized banner of a package name using a FIGlet font.
 *
 * The banner can optionally include the package version appended to the last visible line of the generated ASCII text.
 *
 * This is useful for CLI tools to display a startup banner with project name and version.
 *
 * @remarks
 * - If `displayName` is available and `useDisplayName` is `true`, it will be used instead of `name`.
 * - If `useVersion` is enabled and `pkg.version` exists, the version will be aligned to the
 *   right side of the banner's last visible line.
 * - If the banner contains no printable lines, the raw FIGlet output is printed.
 * - If `color` is disabled, all ANSI styling is turned off.
 *
 * @example
 * ```ts
 * import { print } from "echo-banner";
 * import pkg from "../package.json";
 *
 * await print({
 *   pkg,
 *   font: "Slant"
 * });
 * ```
 *
 * @example Custom version prefix
 * ```ts
 * await print({
 *   pkg,
 *   prefixVersion: "@",
 * });
 * ```
 *
 * @example Disable version output
 * ```ts
 * await print({
 *   pkg,
 *   useVersion: false
 * });
 * ```
 *
 * @example Use package name instead of display name
 * ```ts
 * await print({
 *   pkg,
 *   useDisplayName: false
 * });
 * ```
 *
 * @example Disable colors
 * ```ts
 * await print({
 *   pkg,
 *   color: false
 * });
 * ```
 */
export async function print({
  pkg,
  useVersion = true,
  useDisplayName = true,
  prefixVersion = 'v',
  font = 'Slant',
  color = true,
}: {
  /** Package metadata containing the name, optional display name, and version. */
  pkg: Pick<PackageMeta, 'name' | 'displayName' | 'version'>;
  /**
   * Whether to append the version to the banner.
   *
   * @default true
   */
  useVersion?: boolean;
  /**
   * Prefer `displayName` over `name` when available.
   *
   * @default true
   */
  useDisplayName?: boolean;
  /**
   * Prefix added before the version string.
   *
   * @default "v"
   *
   * @example "v1.0.0"
   */
  prefixVersion?: string;
  /**
   * Figlet font used to render the banner.
   *
   * @default "Slant"
   */
  font?: FontName;
  /**
   * Enable or disable colored output.
   *
   * @default true
   */
  color?: boolean;
}) {
  const name = useDisplayName ? pkg.displayName || pkg.name : pkg.name;
  if (!name) return;
  if (!color)
    colors.config({
      level: 0,
    });

  const data = await figlet.text(name, { font });

  if (!useVersion || !pkg.version) {
    console.log(colors.cyanBright(data));
    return;
  }

  const lines = data.split(EOL);
  const versionText = colors.gray`${prefixVersion}${pkg.version}`;

  const lastLineIndex = lines.findLastIndex((l) => l.trim().length > 0);
  if (lastLineIndex < 0) {
    console.log(colors.cyanBright(data));
    return;
  }

  const maxWidth = Math.max(...lines.map((l) => l.trimEnd().length));
  const lastLine = lines[lastLineIndex]!.trimEnd();
  const GAP = 2;
  const padding = maxWidth - lastLine.length + GAP;

  lines[lastLineIndex] = colors.cyanBright(lastLine) + ' '.repeat(padding) + versionText;

  console.log(lines.join(EOL));
}
