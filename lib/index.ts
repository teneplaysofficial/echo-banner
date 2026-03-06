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
  pkg: PackageMeta;
  shebang?: Shebang | false;
  style?: 'js';
  useDisplayName?: boolean;
  prefixVersion?: string;
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
