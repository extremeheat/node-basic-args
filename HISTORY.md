## 1.3.0
* Add a `validate` function
  * This allows users to validate the output (and raise the help screen on error) before returning the result arg dict, where it wouldn't be possible to print the help screen again.

## 1.2.0
* Extraneous arguments are stored in the `_` index of the output. The nested `_` contains positionals.

## 1.1.0
* Add command alias implementation 

## 1.0.0

Initial