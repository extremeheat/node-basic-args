const basicArgs = require('basic-args')

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
})

console.log('OK, your args were', args)
