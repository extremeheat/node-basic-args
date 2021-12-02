/* eslint-env mocha */
const basicArgs = require('basic-args')
const assert = require('assert')

it('errors', function () {
  assert.throws(() => basicArgs({
    name: 'basic-args-example',
    version: '1.0.0',
    description: 'A basic example of basic-args',
    errorOnUnknown: true,
    throwOnError: true,
    options: {
      version: { type: String, description: 'Version to connect as', alias: 'v' },
      port: { type: Number, description: 'Port to listen on', default: 25565 },
      online: { type: Boolean, description: 'Whether to run in online mode' },
      path: { type: String, description: 'Path to the server directory', default: '.' }
    }
  }, ['--version', '1.0.0', '--port', '25565', '--online', '--path']), { message: /Invalid value/ })
})

it('works', function () {
  const args = basicArgs({
    name: 'basic-args-example',
    version: '1.0.0',
    description: 'A basic example of basic-args',
    errorOnUnknown: true,
    options: {
      version: { type: String, description: 'Version to connect as', alias: 'v' },
      port: { type: Number, description: 'Port to listen on', default: 25565 },
      online: { type: Boolean, description: 'Whether to run in online mode' },
      path: { type: String, description: 'Path to the server directory', default: '.' }
    }
  }, ['-v', '1.0.0', '--port', '25565', '--online'])

  console.log(args)
  assert.strictEqual(args.version, '1.0.0')
  assert.strictEqual(args.port, 25565)
  assert.strictEqual(args.online, true)
  assert.strictEqual(args.path, '.')
})
