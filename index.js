const yargs = require('yargs-parser')

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
  const argv = yargs(args || process.argv.slice(2), {
    configuration: {
      'parse-numbers': false,
    }
  })
  if (options.preprocess) {
    options.preprocess(argv)
  }
  const ranHelpCommand = argv[options.helpCommand || 'help']

  const allOptions = new Map()
  const missing = new Set()
  const haves = new Map()
  const missingPositionals = []

  function raise (message) {
    if (options.throwOnError && message) {
      throw new Error(message)
    }

    let error = `${options.name} - v${options.version}\n`
    error += `${options.description}\n`

    // Show positionals if defined
    if (options.positionals && options.positionals.length) {
      error += '\nPositionals:\n'
      for (const pos of options.positionals) {
        error += `  ${pos.name}\t${pos.description || ''}\n`
      }
    }

    // Show options
    error += '\nOptions:\n'
    for (const [key, value] of Object.entries(options.options || {})) {
      const n = key + (value.alias ? `, -${value.alias}` : '')
      error += `  --${n}\t${value.description || ''}` + (value.default !== undefined ? `  (default: ${value.default})` : '  ') + '\n'
    }

    // Show examples if provided
    if (options.examples && options.examples.length) {
      error += '\nUsage:\n'
      for (const example of options.examples) {
        error += `  ${example}\n`
      }
    }

    if (message) console.warn(message, '\n')
    if (ranHelpCommand) {
      console.log(error)
      process.exit(0)
    }
    console.error(error)
    process.exit(1)
  }

  if (ranHelpCommand) return raise()

  // Check for name conflicts between options and positionals
  const allOptionNames = new Set(Object.keys(options.options || {}))
  const positionalNames = new Set()
  for (const pos of options.positionals || []) {
    if (allOptionNames.has(pos.name)) throw new Error(`Positional argument name "${pos.name}" conflicts with an option name`)
    if (positionalNames.has(pos.name)) throw new Error(`Duplicate positional argument name: ${pos.name}`)
    positionalNames.add(pos.name)
  }

  // Process options
  for (const [key, value] of Object.entries(options.options || {})) {
    if (allOptions.has(key)) {
      throw new Error(`Duplicate option: ${key}`)
    }
    allOptions.set(key, value)
    const V = argv[key] || argv[value.alias]

    if (value.type === Boolean) {
      if (value.default !== undefined) throw Error(`Boolean options cannot have default values (${key})`)
      if (V && boolMap[V] === undefined) {
        return raise(`Invalid value for ${key}, expected boolean. You don't need to put any arguments to use this flag.`)
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
          if (isNaN(V)) return raise(`Invalid value for ${key}, expected number`)
          haves.set(key, Number(V))
        } else if (value.type === String) {
          if (typeof V === 'number') haves.set(key, String(V))
          else if (typeof V !== 'string') return raise(`Invalid value for ${key}, expected a string but got ${typeof V}`)
          else haves.set(key, V)
        } else {
          throw Error(`Unknown type: ${value.type}, in ${key} - must be Boolean, Number, or String`)
        }
      }
    }
  }

  // Process positional arguments
  if (options.positionals && options.positionals.length) {
    const positionalArgs = argv._ || []
    for (const [index, posDef] of options.positionals.entries()) {
      if (index >= positionalArgs.length) {
        missingPositionals.push(posDef.name)
      } else {
        const value = positionalArgs[index]
        if (posDef.type === String) {
          haves.set(posDef.name, String(value))
        } else if (posDef.type === Number) {
          if (isNaN(value)) return raise(`Invalid value for positional argument ${posDef.name}, expected number`)
          haves.set(posDef.name, Number(value))
        } else if (posDef.type === Boolean) {
          if (boolMap[value] === undefined) return raise(`Invalid value for positional argument ${posDef.name}, expected boolean`)
          haves.set(posDef.name, boolMap[value])
        } else {
          throw Error(`Unknown type for positional argument '${posDef.name}': ${posDef.type}`)
        }
      }
    }
    // Store extra positional arguments in '_'
    if (positionalArgs.length > options.positionals.length) {
      haves.set('_', positionalArgs.slice(options.positionals.length))
    }
  } else {
    // If no positionals defined, keep all positional args in '_'
    if (argv._.length) haves.set('_', argv._)
  }

  // Handle missing items
  if (missing.size || missingPositionals.length) {
    let errorMsg = ''
    if (missing.size) errorMsg += `Missing required options: ${Array.from(missing).join(', ')}`
    if (missingPositionals.length) {
      errorMsg += (errorMsg ? '; ' : '') + `Missing required positional arguments: ${missingPositionals.join(', ')}`
    }
    return raise(`** ${errorMsg}`)
  }

  // Handle extra options
  const extra = Object.entries(argv).filter(([key]) => key !== '_' && !allOptions.has(key))
  if (options.errorOnExtra && extra.length) {
    return raise(`** Extraneous options: ${extra.map(([key]) => key).join(', ')}`)
  }
  if (extra.length) {
    haves.set('_', { ...(haves.get('_') || {}), ...Object.fromEntries(extra) })
  }

  const result = Object.fromEntries(haves)

  if (options.validate) {
    const ret = options.validate(result)
    if (ret !== true) raise(ret)
  }

  return result
}

module.exports = parse
