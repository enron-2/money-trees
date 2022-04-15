import { BadRequestException } from '@nestjs/common';
import { RegexPipe } from './regex.pipe';

describe('RegexPipe', () => {
  it('should be defined', () => {
    expect(new RegexPipe(/HI/)).toBeDefined();
  });

  it('should throw on mismatch', () => {
    const pipe = () => {
      new RegexPipe(/hello/).transform('hi', { type: 'param', data: 'hello' });
    };
    expect(pipe).toThrow(BadRequestException);
  });

  it('should return initial value on success', () => {
    const expected = 'hello there';
    const actual = new RegexPipe(/hello/).transform(expected, {
      type: 'param',
      data: 'hello',
    });
    expect(actual).toEqual(expected);
  });
});
