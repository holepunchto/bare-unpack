const test = require('brittle')
const Bundle = require('bare-bundle')
const unpack = require('.')

test('basic', async (t) => {
  async function writeFile(key) {
    if (
      key === 'file:///foo.js' ||
      key === 'file:///bar.js' ||
      key === 'file:///baz.js'
    ) {
      t.pass(key)
    } else {
      t.fail(key)
    }

    return new URL(key).pathname
  }

  const bundle = new Bundle()
    .write('file:///foo.js', "const bar = require('./bar.js')")
    .write('file:///bar.js', "const baz = require('./baz.js')")
    .write('file:///baz.js', 'module.exports = 42')

  const result = await unpack(bundle, writeFile)

  t.alike(result, new Bundle())
})

test('skip addons', async (t) => {
  function writeFile(key) {
    if (key === 'file:///foo.js' || key === 'file:///package.json') {
      t.pass(key)
    } else {
      t.fail(key)
    }

    return new URL(key).pathname
  }

  const bundle = new Bundle()
    .write('file:///foo.js', "const bar = require.addon('.')")
    .write('file:///prebuilds/host/foo.bare', '<native code>', {
      addon: true
    })
    .write('file:///package.json', '{ "name": "foo" }')

  const result = await unpack(bundle, { addons: false }, writeFile)

  const expected = new Bundle().write(
    'file:///prebuilds/host/foo.bare',
    '<native code>',
    {
      addon: true
    }
  )

  t.alike(result, expected)
})

test('only addons', async (t) => {
  function writeFile(key) {
    if (key === 'file:///prebuilds/host/foo.bare') {
      t.pass(key)
    } else {
      t.fail(key)
    }

    return new URL(key).pathname
  }

  const bundle = new Bundle()
    .write('file:///foo.js', "const bar = require.addon('.')", {
      imports: {
        '.': 'file:///prebuilds/host/foo.bare'
      }
    })
    .write('file:///prebuilds/host/foo.bare', '<native code>', {
      addon: true
    })
    .write('file:///package.json', '{ "name": "foo" }')

  const result = await unpack(bundle, { files: false, addons: true }, writeFile)

  const expected = new Bundle()
    .write('file:///foo.js', "const bar = require.addon('.')", {
      imports: {
        '.': '/prebuilds/host/foo.bare'
      }
    })
    .write('file:///package.json', '{ "name": "foo" }')

  t.alike(result, expected)
})

test('directory assets', async (t) => {
  const bundle = new Bundle()
    .write('file:///foo.js', "const dir = require.asset('./dir')", {
      imports: {
        './dir': 'file:///dir'
      }
    })
    .write('file:///dir/bar.txt', 'hello bar', {
      asset: true
    })
    .write('file:///dir/baz.txt', 'hello baz', {
      asset: true
    })
    .write('file:///package.json', '{ "name": "foo" }')

  function writeFile(key) {
    if (key === 'file:///dir/bar.txt' || key === 'file:///dir/baz.txt') {
      t.pass(key)
    } else {
      t.fail(key)
    }

    return new URL(key).pathname
  }

  const result = await unpack(bundle, { files: false, assets: true }, writeFile)

  const expected = new Bundle()
    .write('file:///foo.js', "const dir = require.asset('./dir')", {
      imports: {
        './dir': '/dir'
      }
    })
    .write('file:///package.json', '{ "name": "foo" }')

  t.alike(result, expected)
})
