# echo-banner

> Banners made simple

[![npm version](https://img.shields.io/npm/v/echo-banner.svg?logo=npm&color=brightgreen)](https://www.npmjs.com/package/echo-banner)
[![Downloads](https://img.shields.io/npm/dt/echo-banner?logo=npm)](https://www.npmjs.com/package/echo-banner)
[![codecov](https://codecov.io/gh/teneplaysofficial/echo-banner/graph/badge.svg?token=eFs6Vkxzly)](https://codecov.io/gh/teneplaysofficial/echo-banner)

echo-banner helps you add clean metadata banners to builds and display beautiful ASCII titles in CLI applications.

## Installation

```sh
npm install echo-banner
```

## Usage

```ts
import { banner } from 'echo-banner';
import pkg from './package.json';

const result = banner({ pkg });

console.log(result);
/*!
 * echo-banner v1.0.0
 * Banners made simple
 *
 * (c) 2026 TenE
 * Released under the MIT License
 *
 * https://example.com
 * https://github.com/teneplaysofficial/echo-banner
 */
```

## API

### `banner(options)`

Generate a formatted banner string. See the [API docs](https://teneplaysofficial.github.io/echo-banner/functions/banner.html)

```ts
banner(options: BannerOptions): string
```
