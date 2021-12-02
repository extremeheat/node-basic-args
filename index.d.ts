declare module "basic-cli" {
  type Option = {
    name: string;
    type: Boolean | String | Number;
    alias?: string;
    description?: string;
    default?: any;
  }
  // The second argument is the custom arg array if any, otherwise default to `process.argv`  
  export default function(options: {
    name: string,
    version: string,
    description: string,
    throwOnError?: boolean, // Throw an error instead of calling process.exit() with help screen (default: false)
    errorOnExtra?: boolean, // Throw an error if there are extra arguments (default: false)
    helpCommand?: string, // The -- command for opening the built-in help screen (default: help)
    options: Option[]
  }, arguments?: string[])
}
