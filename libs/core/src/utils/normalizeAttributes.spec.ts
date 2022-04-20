import { Expose } from 'class-transformer';
import { normalizeAttributes } from './normalizeAttributes';

class TestClass {
  @Expose()
  prop1: string;

  @Expose()
  prop2: number;
}

describe('Normalize attributes from class util', () => {
  it('Returns a list of string given properly decorated class', () => {
    const attrs = normalizeAttributes(TestClass);
    expect(attrs).toBeDefined();
    expect(attrs.length).toBe(2);
    expect(attrs).toContain('prop1');
    expect(attrs).toContain('prop2');
  });

  it('Returns a list of string given another list of string', () => {
    const attrs = normalizeAttributes(['hi', 'there']);
    expect(attrs).toBeDefined();
    expect(attrs.length).toBe(2);
    expect(attrs).toContain('hi');
    expect(attrs).toContain('there');
  });

  it('Returns a list of string given an object', () => {
    const attrs = normalizeAttributes({ field1: 1, field2: 2 });
    expect(attrs).toBeDefined();
    expect(attrs.length).toBe(2);
    expect(attrs).toContain('field1');
    expect(attrs).toContain('field2');
  });
});
