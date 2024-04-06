## 1.4.1
* [Fix string/number parsing (#6)](https://github.com/extremeheat/node-basic-args/commit/18a3aa49efab910ed38d7f5dea22b6d4bf15fc5d) (thanks @extremeheat)

## 1.4.0
* [Add a preprocess() hook before any parsing is done by basic-args](https://github.com/extremeheat/node-basic-args/commit/c7a9af15aa0412957a6d5d9291a9c0f889604b2a) (thanks @extremeheat)
* [Exit normally when using --help argument](https://github.com/extremeheat/node-basic-args/commit/fc39c812f0331261557aec5b9821119fedd1e444) (thanks @extremeheat)
* [Create commands.yml workflow](https://github.com/extremeheat/node-basic-args/commit/7923f73bd516afb39f1e6c27b0048433ec3f9a67) (thanks @extremeheat)

## 1.3.0
* Add a `validate` function
  * This allows users to validate the output (and raise the help screen on error) before returning the result arg dict, where it wouldn't be possible to print the help screen again.

## 1.2.0
* Extraneous arguments are stored in the `_` index of the output. The nested `_` contains positionals.

## 1.1.0
* Add command alias implementation 

## 1.0.0

Initial