#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { command, flag, arg, summary } = require('paparam')
const Bundle = require('bare-bundle')
const pkg = require('./package')
const unpack = require('.')

const cmd = command(
  pkg.name,
  summary(pkg.description),
  arg('<entry>', 'The bundle to unpack'),
  flag('--version|-v', 'Print the current version'),
  flag('--out|-o <path>', 'The output path of the unpacked bundle'),
  async (cmd) => {
    const { entry } = cmd.args
    const { version, out = '.' } = cmd.flags

    if (version) return console.log(`v${pkg.version}`)

    const bundle = Bundle.from(fs.readFileSync(entry))

    await unpack(bundle, async (key) => {
      const target = path.join(out, key)
      await fs.promises.mkdir(path.dirname(target), { recursive: true })
      await fs.promises.writeFile(target, bundle.read(key))
    })
  }
)

cmd.parse()
