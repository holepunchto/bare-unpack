# bare-unpack

Bundle unpacking for Bare.

```
npm i bare-unpack
```

## Usage

```js
const unpack = require('bare-unpack')

async function writeFile(key, data, mode) {
  // Write `data` to disk and return the resulting path
}

await unpack(bundle, writeFile)
```

## License

Apache-2.0
