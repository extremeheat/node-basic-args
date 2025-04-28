declare module "basic-args" {
  type Option = {
    type: BooleanConstructor | StringConstructor | NumberConstructor;
    alias?: string;
    description?: string;
    default?: any;
  }

  type Positional = {
    name: string;
    type: BooleanConstructor | StringConstructor | NumberConstructor;
    description?: string;
  }

  type Result = Record<string, boolean | string | number | { [key: string]: any }>

  // The second argument is the custom arg array if any, otherwise defaults to `process.argv`
  export default function(options: {
    name: string;
    version: string;
    description: string;
    throwOnError?: boolean; // Throw an error instead of calling process.exit() with help screen (default: false)
    errorOnExtra?: boolean; // Throw an error if there are extra arguments (default: false)
    helpCommand?: string; // The -- command for opening the built-in help screen (default: help)
    options?: Record<string, Option>; // Object containing the list of options program takes
    positionals?: Positional[]; // Array of required positional arguments
    examples?: string[]; // Array of usage example strings for the help screen
    // Pre-process the yargs parsed arguments before basic-args does any handling
    preprocess?(args: Record<string, any>): void;
    // Return true if the result is valid, otherwise a string to raise to the user along with help screen
    validate?(args: Result): true | string;
  }, args?: string[]): Result
}
