# bare-unpack

Bundle unpacking for Bare.

```
npm i [-g] bare-unpack
```

## Usage

```js
const unpack = require('bare-unpack')

async function writeFile(key) {
  // Write the data for `key` to disk or elsewhere and return the resulting path
}

const repacked = await unpack(bundle, writeFile)
```

## API

#### `const repacked = await unpack(bundle[, options], writeFile)`

Unpack `bundle`, writing either all or parts of its files to disk or elsewhere. `writeFile` is called with the key of every file to write and must return the path to which the file corresponding to the key is written. Any files not written elsewhere will be repacked into a new bundle, which is returned to the caller, and any references to files written outside the bundle will be rewritten.

Options include:

```js
options = {
  files: true,
  addons: files,
  assets: files,
  concurrency: 0
}
```

## CLI

#### `bare-unpack [flags] <entry>`

Unpack the bundle at `<entry>` to `--out` which defaults to `.`

Flags include:

```console
--version|-v
--out|-o <path>
--help|-h
```

## License

Apache-2.0
