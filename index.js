const boolMap = {
  true: true,
  false: false,
  1: true,
  0: false,
  t: true,
  f: false,
  y: true,
  n: false,
  yes: true,
  no: false
}

function parse (options, args) {
  const argv = require('yargs-parser')(args || process.argv.slice(2))

  const allOptions = new Map()
  const missing = new Set()
  const haves = new Map()

  function raise (message) {
    if (options.throwOnError && message) {
      throw new Error(message)
    }

    let error = `${options.name} - v${options.version}\n`
    error += `${options.description}\n`

    if (options.examples) {
      error += 'Usage:\n'
      for (const example of options.examples) {
        error += `  ${example}\n`
      }
    }

    error += '\nOptions:\n'
    for (const [key, value] of Object.entries(options.options)) {
      if (Array.isArray(value)) {
        console.log('\t', key)
        for (const [k, v] of value.entries()) {
          error += `  --${k}\t${v.description}` + (v.default ? `  (default: ${v.default})` : '  ') + '\n'
        }
      } else {
        error += `  --${key}\t${value.description}` + (value.default ? `  (default: ${value.default})` : '  ') + '\n'
      }
    }

    if (message) console.warn(message, '\n')
    console.error(error)
    process.exit(1)
  }

  if (argv[options.helpCommand || 'help']) return raise()

  for (const [k, v] of Object.entries(options.options)) {
    for (const [key, value] of Array.isArray(v) ? v : [[k, v]]) {
      if (allOptions.has(key)) {
        throw new Error(`Duplicate option: ${key}`)
      }
      allOptions.set(key, value)
      const V = argv[key]

      if (value.type === Boolean) {
        if (value.default !== undefined) throw Error(`Boolean options cannot have default values (${key})`)

        if (V && boolMap[V] === undefined) {
          return raise(`Invalid value for ${key}, expected boolean (true/false/yes/no/0/1)`, options)
        }
        haves.set(key, boolMap[V] || V || false)
      } else {
        if (V === undefined) {
          if (value.default === undefined) {
            missing.add(key)
          } else {
            haves.set(key, value.default)
          }
        } else {
          if (value.type === Number) {
            if (isNaN(V)) return raise(`Invalid value for ${key}, expected number`, options)
            haves.set(key, Number(V))
          } else if (value.type === String) {
            if (typeof V === 'number') haves.set(key, String(V))
            else if (typeof V !== 'string') return raise(`Invalid value for ${key}, expected a string but got ${typeof V}`, options)
            else haves.set(key, V)
          } else {
            throw Error(`Unknown type: ${value.type}, in ${key} - must be Boolean, Number, or String`)
          }
        }
      }
    }
  }

  if (missing.size) {
    const missingList = Array.from(missing).join(', ')
    return raise(`** Missing required options: ${missingList}`, options)
  }

  return Object.fromEntries(haves)
}

module.exports = parse
