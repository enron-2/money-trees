import { Validator } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsNonEmptyString } from './nonEmptyString.validator';

class ValidateMe {
  @IsNonEmptyString()
  field: string;
}

const validator = new Validator();

describe('Non Empty String Validator', () => {
  it('Normal non-empty string', () => {
    const input = plainToInstance(ValidateMe, {
      field: 'Lorem yeetsum',
    });
    const errors = validator.validateSync(input);
    expect(errors.length).toBe(0);
  });

  it('Not a string', () => {
    const input = plainToInstance(ValidateMe, {
      field: { toYeet: 69, orNotToYeet: 420 },
    });
    const errors = validator.validateSync(input);
    expect(errors.length).toBe(1);
  });

  it('An empty string', () => {
    const input = plainToInstance(ValidateMe, {
      field: '',
    });
    const errors = validator.validateSync(input);
    expect(errors.length).toBe(1);
  });

  it('String with only white-space', () => {
    const input = plainToInstance(ValidateMe, {
      field: '                             ',
    });
    const errors = validator.validateSync(input);
    expect(errors.length).toBe(1);
  });
});
