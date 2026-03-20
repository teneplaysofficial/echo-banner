import figlet from 'figlet';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { banner, print } from '@/lib';
import pkg from '../package.json';

vi.mock('figlet', () => ({
  default: {
    text: vi.fn(),
  },
}));

const year = new Date().getFullYear();

function removeKeys<T extends object>(obj: T, keys: (keyof T)[]) {
  for (const key of keys) delete obj[key];
  return obj;
}

let fakePkg: Parameters<typeof banner>[0]['pkg'];

describe('banner', () => {
  beforeEach(() => {
    fakePkg = structuredClone(pkg);
  });

  it('generates banner using package metadata', () => {
    const result = banner({ pkg: fakePkg });

    expect(result).toContain(pkg.name);
    expect(result).toContain(pkg.version);
    expect(result).toContain(pkg.description);
  });

  it('includes license information when present', () => {
    const result = banner({ pkg: fakePkg });

    expect(result).toMatch(pkg.license);
  });

  it('includes author and current year', () => {
    const result = banner({ pkg: fakePkg });

    expect(result).toContain(`(c) ${year}`);
    expect(result).toContain(pkg.author);
  });

  it('supports author object format', () => {
    fakePkg.author = { name: 'Sriman' };

    const result = banner({ pkg: fakePkg });

    expect(result).toContain('Sriman');
  });

  it('handles author object without name', () => {
    fakePkg.author = {};

    const result = banner({ pkg: fakePkg });

    expect(result).toContain(`(c) ${year}`);
  });

  it('supports repository object format', () => {
    fakePkg.repository = {
      type: 'git',
      url: 'git+https://github.com/test/repo.git',
    };

    const result = banner({ pkg: fakePkg });

    expect(result).toContain('https://github.com/test/repo');
  });

  it('handles repository object without url', () => {
    fakePkg.repository = {};

    const result = banner({ pkg: fakePkg });

    expect(result).not.toMatch(/https:\/\/github\.com\//);
  });

  it('handles missing description', () => {
    removeKeys(fakePkg, ['description']);

    const result = banner({ pkg: fakePkg });

    expect(result).not.toContain(pkg.description);
  });

  it('omits license line when license is missing', () => {
    removeKeys(fakePkg, ['license']);

    const result = banner({ pkg: fakePkg });

    expect(result).not.toContain('Released under');
  });

  it('omits homepage when homepage is missing', () => {
    removeKeys(fakePkg, ['homepage']);

    const result = banner({ pkg: fakePkg });

    expect(result).not.toContain(pkg.homepage);
  });

  it('omits repository when repository is missing', () => {
    removeKeys(fakePkg, ['repository']);

    const result = banner({ pkg: fakePkg });

    expect(result).not.toContain(pkg.repository);
  });

  it('uses fallback name when name is missing', () => {
    removeKeys(fakePkg, ['name']);

    const result = banner({
      pkg: fakePkg,
      fallback: { name: 'fallback-lib', version: '1.0.0' },
    });

    expect(result).toContain('fallback-lib');
  });

  it('uses fallback version when version is missing', () => {
    removeKeys(fakePkg, ['version']);

    const result = banner({
      pkg: fakePkg,
      fallback: { name: 'test', version: '9.9.9' },
    });

    expect(result).toContain('v9.9.9');
  });

  it('uses displayName when enabled', () => {
    const result = banner({
      pkg: fakePkg,
      useDisplayName: true,
    });

    expect(result).toContain(pkg.displayName);
  });

  it('falls back to name when disabled', () => {
    const result = banner({
      pkg: fakePkg,
      useDisplayName: false,
    });

    expect(result).toContain(pkg.name);
  });

  it('prepends shebang when provided', () => {
    const result = banner({
      pkg: fakePkg,
      shebang: '#!/usr/bin/env node',
    });

    expect(result.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('does not include shebang by default', () => {
    const result = banner({ pkg: fakePkg });

    expect(result.startsWith('#!')).toBe(false);
  });

  it('throws error when pkg is invalid', () => {
    expect(() => banner({ pkg: null as unknown as object })).toThrow(TypeError);
  });
});

describe('print', () => {
  const mockConsole = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prints banner', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`AAA\nBBB`);

    await print({ pkg, color: false });

    expect(figlet.text).toHaveBeenCalledWith(pkg.displayName, { font: 'Slant' });

    expect(mockConsole).toHaveBeenCalledTimes(1);

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toContain('AAA');
    expect(output).toContain('BBB');
    expect(output).toContain(pkg.version);
  });

  it('prints banner without version', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`AAA\nBBB`);

    await print({
      pkg,
      useVersion: false,
      color: false,
    });

    expect(mockConsole).toHaveBeenCalledWith(`AAA\nBBB`);
  });

  it('uses pkg.name when useDisplayName disabled', async () => {
    vi.mocked(figlet.text).mockResolvedValue('AAA');

    await print({
      pkg,
      useDisplayName: false,
      color: false,
    });

    expect(figlet.text).toHaveBeenCalledWith(pkg.name, { font: 'Slant' });
  });

  it('uses custom version prefix', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`AAA\nBBB`);

    await print({
      pkg,
      prefixVersion: 'ver-',
      color: false,
    });

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toContain(`ver-${pkg.version}`);
  });

  it('prints without version when pkg.version missing', async () => {
    vi.mocked(figlet.text).mockResolvedValue('AAA');

    await print({
      pkg: { name: 'testpkg' },
      color: false,
    });

    expect(mockConsole).toHaveBeenCalledWith('AAA');
  });

  it('does nothing if name is missing', async () => {
    await print({
      pkg: {},
    });

    expect(figlet.text).not.toHaveBeenCalled();
    expect(mockConsole).not.toHaveBeenCalled();
  });

  it('handles figlet output with empty lines', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`AAA\n\nBBB`);

    await print({ pkg, color: false });

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toContain(`v${pkg.version}`);
  });

  it('uses custom font', async () => {
    vi.mocked(figlet.text).mockResolvedValue('AAA');

    await print({
      pkg,
      font: 'Standard',
      color: false,
    });

    expect(figlet.text).toHaveBeenCalledWith(pkg.displayName, {
      font: 'Standard',
    });
  });

  it('prints raw data when figlet output has no visible characters', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`\n\n\n`);

    await print({ pkg, color: false });

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toBe(`\n\n\n`);
  });

  it('enables color by default', async () => {
    vi.mocked(figlet.text).mockResolvedValue('AAA');

    await print({ pkg });

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toContain('AAA');
  });

  it('disables color when color is false', async () => {
    vi.mocked(figlet.text).mockResolvedValue('AAA');

    await print({
      pkg,
      color: false,
    });

    const output = mockConsole.mock.calls[0]?.[0];

    expect(output).toContain('AAA');
  });

  it('applies version on last visible line only', async () => {
    vi.mocked(figlet.text).mockResolvedValue(`AAA\nBBB\nCCC`);

    await print({ pkg, color: false });

    const output = mockConsole.mock.calls[0]?.[0];
    const lines = output.split('\n');

    expect(lines[lines.length - 1]).toContain(`v${pkg.version}`);
  });
});
