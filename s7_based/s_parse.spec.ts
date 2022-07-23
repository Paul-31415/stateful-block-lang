import { isCons, parse, Cons, ParseError } from './s_parse';
import {describe, expect, test} from '@jest/globals';

describe('isCons', () => {
  test('checks if a thing is a cons cell', () => {
    expect(isCons({car:"a",cdr:null,_is_Cons:true})).toBe(true);
    expect(isCons(null)).toBeFalsy();
  });
});


describe('parse', () => {
  test('parses an empty cell', () => {
    expect(parse('()')).toBeNull();
  });

  test('parses a cons cell', () => {
    const parsed = parse('(foo bar baz)');
    const expected: Cons = {
      _is_Cons: true,
      car: 'foo',
      cdr: {
        _is_Cons: true,
        car: 'bar',
        cdr: {
          _is_Cons: true,
          car: 'baz',
          cdr: null,
        }
      }
    };
    expect(parsed).toEqual(expected);
  });

  test('throws a syntax error when missing a close parenthesis', () => {
    expect(() => {
      parse('(cons 4 5'); // Note no close paren
    }).toThrowError(new ParseError(["unmatched '('"]));
  });
  test('parses a recursive structure', () => {
    const parsed = parse('#1=(1 . #1#)');
    const expected: Cons = {
      _is_Cons: true,
      car: '1',
      cdr: null,
    };
    expected.cdr = expected;
    expect(parsed).toEqual(expected);
  });

});
