declare module "basic-cli" {
  export default function(options: {
    name: string,
    version: string,
    description: string,
    throwOnError?: boolean, // Throw an error instead of calling process.exit() with help screen (default: false)
    helpCommand?: string, // The -- command for opening the built-in help screen (default: help)
    options: Object
  })
}