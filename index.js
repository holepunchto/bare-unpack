const path = require('path')
const Semaphore = require('promaphore')
const Bundle = require('bare-bundle')

module.exports = async function unpack(bundle, opts, writeFile) {
  if (typeof opts === 'function') {
    writeFile = opts
    opts = {}
  }

  const { files = true, addons = files, assets = files, concurrency = 0 } = opts

  const semaphore = concurrency > 0 ? new Semaphore(concurrency) : null

  const unpack = new Set()

  if (files === true) {
    for (const key of bundle.keys()) unpack.add(key)

    if (addons !== true) {
      for (const key of bundle.addons) unpack.delete(key)
    }

    if (assets !== true) {
      for (const key of bundle.assets) unpack.delete(key)
    }
  } else {
    if (addons === true) {
      for (const key of bundle.addons) unpack.add(key)
    }

    if (assets === true) {
      for (const key of bundle.assets) unpack.add(key)
    }
  }

  const repack = new Set()
  const rewrites = new Map()
  const promises = []

  for (const key of bundle.keys()) promises.push(process(key))

  await Promise.all(promises)

  const result = new Bundle()

  if (files !== true) result.main = bundle.main

  result.imports = rewriteImportsMap(bundle.imports, rewrites)

  if (addons !== true) result.addons = bundle.addons
  if (assets !== true) result.assets = bundle.assets

  for (const key of repack) {
    result.write(key, bundle.read(key), {
      mode: bundle.mode(key),
      imports: rewriteImportsMap(bundle.resolutions[key], rewrites)
    })
  }

  return result

  async function process(key) {
    if (semaphore !== null) await semaphore.wait()

    if (unpack.has(key)) {
      let target = String(await writeFile(key))

      rewrites.set(key, target)

      let url = new URL(key)

      for (;;) {
        url.pathname = url.pathname.substring(0, url.pathname.lastIndexOf('/'))

        if (url.pathname === '' || url.pathname === '/') break

        target = path.dirname(target)

        rewrites.set(url.href, target)
      }
    } else {
      repack.add(key)
    }

    if (semaphore !== null) semaphore.signal()
  }
}

function rewriteImportsMap(imports, rewrites) {
  if (typeof imports !== 'object' || imports === null) return null

  return transformImportsMap(imports, (value) => rewrites.get(value) || value)
}

function transformImportsMap(value, fn) {
  const imports = {}

  for (const entry of Object.entries(value)) {
    const condition = entry[0]

    imports[condition] = transformImportsMapEntry(entry[1], fn)
  }

  return imports
}

function transformImportsMapEntry(value, fn) {
  if (typeof value === 'string') return fn(value)

  return transformImportsMap(value, fn)
}
