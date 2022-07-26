import { isCons, parse, Cons, ParseError } from './s_parse';
import {describe, expect, test} from '@jest/globals';

describe('isCons', () => {
  test('checks if a thing is a cons cell', () => {
    expect(isCons(new Cons("a",null))).toBe(true);
    expect(isCons(null)).toBeFalsy();
  });
});


describe('parse', () => {
  test('parses an empty cell', () => {
    expect(parse('()')).toBeNull();
  });

  test('parses a cons cell', () => {
    const parsed = parse('(foo bar baz)');
    const expected: Cons = new Cons('foo',new Cons('bar', new Cons('baz',null)));
    expect(parsed).toEqual(expected);
  });

  test('throws a syntax error when missing a close parenthesis', () => {
    expect(() => {
      parse('(cons 4 5'); // Note no close paren
    }).toThrowError(new ParseError(["unmatched '('"]));
  });
  test('parses a recursive structure', () => {
    const parsed = parse('#1=(1 . #1#)');
    const expected: Cons = new Cons('1',null);
    expected.cdr = expected;
    expect(parsed).toEqual(expected);
  });

  test('parses (foo . bar)', () => {
    const expected: Cons = new Cons('foo','bar');
    expect(parse('(foo . bar)')).toEqual(expected);
  });
  test('parses all features',() => {
    expect(parse("#1='(\"foo \\\"\\n\\\\\\\"\\\\ ( + 2 )))\\t  \\\\\" #2=(#1# . 2) #1# . #2#) ")).toBeDefined();
  });
});
