/*
 * JS program for parsing and evaluating Brainfuck code
 * (c) Kabir Goel
 */

// Rather than hardcoding the value of each token, use constants
// This allows me to change the syntax of the language easily
const TOKEN_INCR = '+';
const TOKEN_DECR = '-';
const TOKEN_LEFT = '<';
const TOKEN_RIGHT = '>';
const TOKEN_LOOP_START = '[';
const TOKEN_LOOP_STOP = ']';
const TOKEN_INPUT = ',';
const TOKEN_PRINT = '.';

/*
 * Parse a blob of Brainfuck code
 * @param {string} blob The Brainfuck code
 * @returns {object} Object with a res and error: if error != ''
 *                   don't read res
 */
function parse(blob) {
  let res = [];

  for (let i = 0; i < blob.length; i++) {
      if (blob[i] == TOKEN_LOOP_START) {
        let innerContent = '';
        let balance = 0;
        do {
          // the following if will always exec on the first iteration because
          // we never incremented i after the previous if so we're still
          // on the same token
          if (blob[i] == TOKEN_LOOP_START) {
            balance++;
            if (balance > 1) {
              innerContent += blob[i];
            }
          } else if (blob[i] == TOKEN_LOOP_STOP) {
            balance--;
            if (balance > 0) {
              innerContent += blob[i];
            }
          } else {
            innerContent += blob[i];
          }
          i++;
        } while (balance != 0 && i < blob.length);
        if (balance != 0) {
          return {'error': 'unterminated loop'};
        }
        // recursive goodness -- the base case is code without loops
        let innerParsed = parse(innerContent);
        if (innerParsed.error != '') {
          return innerParsed;
        }
        res.push(innerParsed.res);
    } else {
      res.push(blob[i]);
    }
  }

  return {'res': res, 'error': ''};
}

/*
 * Evaluate a blob of Brainfuck code
 * @param {string} blob The Brainfuck code
 * @returns {object} Object with some results and error. Results include
 *                   stdout, ptrPos (data pointer position) and
 *                   mem (program memory). If error != '' don't read other
 *                   properties.
 */
function eval(blob) {
  // generate 30000 cells
  let mem = Array(...Array(30000)).map(Number.prototype.valueOf, 0);
  let datPtr = 0;
  let programOutput = [];

  // used for checking the balance of loop start and end delimiters
  // has to be declared here because of weird switch statement semantics
  let balance;
  for (let i = 0; i < blob.length; i++) {
    switch (blob[i]) {
      case TOKEN_INCR:
        mem[datPtr]++;
        break;
      case TOKEN_DECR:
        mem[datPtr]--;
        break;
      case TOKEN_RIGHT:
        datPtr++;
        break;
      case TOKEN_LEFT:
        datPtr--;
        break;
      case TOKEN_INPUT:
        // not specified in instructions
        break;
      case TOKEN_PRINT:
        programOutput.push(String.fromCharCode(mem[datPtr]));
        break;
      case TOKEN_LOOP_START:
        balance = 0;
        // if the current cell is 0, skip to the end of the loop
        // i.e. don't loop
        if (mem[datPtr] == 0) {
          // skip to the end of the loop
          // balance ensures that nested loops don't mess things up
          do {
            if (blob[i] == TOKEN_LOOP_START) {
              balance++;
            } else if (blob[i] == TOKEN_LOOP_STOP) {
              balance--;
            }
            i++;
          } while (balance != 0 && i < blob.length);
          if (balance != 0) {
            return {'error': 'unterminated loop'};
          }
        }
        break;
      case TOKEN_LOOP_STOP:
        balance = 0;
        if (mem[datPtr] > 0) {
          do {
            if (blob[i] == TOKEN_LOOP_START) {
              balance++;
            } else if (blob[i] == TOKEN_LOOP_STOP) {
              balance--;
            }
            i--;
          } while (balance != 0 && i < blob.length);
          if (balance != 0) {
            return {'error': 'unterminated loop'};
          }
        }
        break;
    }
  }
  return {'ptrPos': datPtr, 'stdout': programOutput, 'mem': mem, 'error': ''};
}

module.exports = {
  'parse': parse,
  'eval': eval,
};
