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
    configuration: { 'parse-numbers': false }
  })
  if (options.preprocess) options.preprocess(argv)

  const helpCommand = options.helpCommand || 'help'
  const ranGlobalHelp = argv[helpCommand]

  // Show global help if --help is used or no arguments are provided and no commands
  if (ranGlobalHelp || (!argv._.length && !options.commands)) {
    return raiseHelp(options, null, true)
  }

  // Handle commands
  if (options.commands && argv._.length) {
    const commandName = argv._[0]
    const command = options.commands.find(cmd => cmd.name === commandName)
    if (!command) {
      return raiseHelp(options, `Unknown command: ${commandName}`)
    }

    // Parse command arguments
    const commandArgs = argv._.slice(1)
    const commandOptions = {
      ...options,
      name: `${options.name} ${command.name}`,
      description: command.description,
      options: command.options,
      positionals: command.positionals,
      examples: command.examples,
      preprocess: command.preprocess,
      validate: command.validate
    }
    const commandResult = parseCommand(commandOptions, commandArgs)

    // Include global options
    const globalResult = parseGlobalOptions(options, argv)
    return { ...globalResult, [command.name]: commandResult }
  }

  // No commands, parse as usual
  return parseMainCommand(options, argv)
}

function parseCommand (options, args) {
  const argv = yargs(args, { configuration: { 'parse-numbers': false } })
  if (options.preprocess) options.preprocess(argv)

  const ranHelpCommand = argv[options.helpCommand || 'help']
  if (ranHelpCommand) {
    return raiseHelp(options, null, true)
  }

  return parseMainCommand(options, argv)
}

function parseMainCommand (options, argv) {
  const allOptions = new Map()
  const missing = new Set()
  const haves = new Map()
  const missingPositionals = []

  // Process options
  for (const [key, value] of Object.entries(options.options || {})) {
    if (allOptions.has(key)) throw new Error(`Duplicate option: ${key}`)
    allOptions.set(key, value)
    const V = argv[key] || argv[value.alias]

    if (value.type === Boolean) {
      if (value.default !== undefined) throw Error(`Boolean options cannot have default values (${key})`)
      if (V && boolMap[V] === undefined) {
        return raiseHelp(options, `Invalid value for ${key}, expected boolean. No arguments needed for this flag.`)
      }
      haves.set(key, boolMap[V] || V || false)
    } else {
      if (V === undefined) {
        if (value.default === undefined) missing.add(key)
        else haves.set(key, value.default)
      } else {
        if (value.type === Number) {
          if (isNaN(V)) return raiseHelp(options, `Invalid value for ${key}, expected number`)
          haves.set(key, Number(V))
        } else if (value.type === String) {
          if (typeof V === 'number') haves.set(key, String(V))
          else if (typeof V !== 'string') return raiseHelp(options, `Invalid value for ${key}, expected string but got ${typeof V}`)
          else haves.set(key, V)
        } else {
          throw Error(`Unknown type: ${value.type}, in ${key} - must be Boolean, Number, or String`)
        }
      }
    }
  }

  // Process positional arguments
  if (options.positionals?.length) {
    const positionalArgs = argv._ || []
    for (const [index, posDef] of options.positionals.entries()) {
      if (index >= positionalArgs.length) {
        missingPositionals.push(posDef.name)
      } else {
        const value = positionalArgs[index]
        if (posDef.type === String) {
          haves.set(posDef.name, String(value))
        } else if (posDef.type === Number) {
          if (isNaN(value)) return raiseHelp(options, `Invalid value for positional argument ${posDef.name}, expected number`)
          haves.set(posDef.name, Number(value))
        } else if (posDef.type === Boolean) {
          if (boolMap[value] === undefined) return raiseHelp(options, `Invalid value for positional argument ${posDef.name}, expected boolean`)
          haves.set(posDef.name, boolMap[value])
        } else {
          throw Error(`Unknown type for positional argument: ${posDef.type}`)
        }
      }
    }
    if (positionalArgs.length > options.positionals.length) {
      haves.set('_', positionalArgs.slice(options.positionals.length))
    }
  } else if (argv._.length) {
    haves.set('_', argv._)
  }

  // Handle missing items
  if (missing.size || missingPositionals.length) {
    let errorMsg = ''
    if (missing.size) errorMsg += `Missing required options: ${Array.from(missing).join(', ')}`
    if (missingPositionals.length) {
      errorMsg += (errorMsg ? '; ' : '') + `Missing required positional arguments: ${missingPositionals.join(', ')}`
    }
    return raiseHelp(options, `** ${errorMsg}`)
  }

  // Handle extra options
  const extra = Object.entries(argv).filter(([key]) => key !== '_' && !allOptions.has(key))
  if (options.errorOnExtra && extra.length) {
    return raiseHelp(options, `** Extraneous options: ${extra.map(([key]) => key).join(', ')}`)
  }
  if (extra.length) {
    haves.set('_', { ...(haves.get('_') || {}), ...Object.fromEntries(extra) })
  }

  const result = Object.fromEntries(haves)
  if (options.validate) {
    const ret = options.validate(result)
    if (ret !== true) return raiseHelp(options, ret)
  }
  return result
}

function parseGlobalOptions (options, argv) {
  const globalOptions = options.globalOptions || {}
  const haves = new Map()

  for (const [key, value] of Object.entries(globalOptions)) {
    const V = argv[key] || argv[value.alias]
    if (value.type === Boolean) {
      if (value.default !== undefined) throw Error(`Boolean global options cannot have default values (${key})`)
      haves.set(key, boolMap[V] || V || false)
    } else if (V !== undefined) {
      if (value.type === Number) {
        if (isNaN(V)) throw Error(`Invalid value for global option ${key}, expected number`)
        haves.set(key, Number(V))
      } else if (value.type === String) {
        haves.set(key, String(V))
      }
    } else if (value.default !== undefined) {
      haves.set(key, value.default)
    }
  }
  return Object.fromEntries(haves)
}

function raiseHelp (options, message, isHelp = false) {
  if (options.throwOnError && message) {
    throw new Error(message)
  }

  let output = `${options.name} - v${options.version}\n${options.description}\n`

  // Show commands if at global level
  if (options.commands && !options.options && !options.positionals) {
    output += '\nCommands:\n'
    for (const cmd of options.commands) {
      output += `  ${cmd.name}\t${cmd.description || ''}\n`
    }
  }

  // Show positionals if defined
  if (options.positionals?.length) {
    output += '\nPositionals:\n'
    for (const pos of options.positionals) {
      output += `  ${pos.name}\t${pos.description || ''}\n`
    }
  }

  // Show options
  output += '\nOptions:\n'
  for (const [key, value] of Object.entries(options.options || options.globalOptions || {})) {
    const n = key + (value.alias ? `, -${value.alias}` : '')
    output += `  --${n}\t${value.description || ''}${value.default !== undefined ? `  (default: ${value.default})` : ''}\n`
  }

  // Show examples if provided
  if (options.examples?.length) {
    output += '\nUsage:\n'
    for (const example of options.examples) {
      output += `  ${example}\n`
    }
  }

  if (message) console.warn(message, '\n')
  if (isHelp) {
    console.log(output)
    process.exit(0)
  }
  console.error(output)
  process.exit(1)
}

module.exports = parse
