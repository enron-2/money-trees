import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNonEmptyString(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBase64Hash',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isNonEmptyString(value),
      },
    });
  };
}

export function isNonEmptyString(value: unknown) {
  if (!(typeof value === 'string')) return false;
  return value.trim().length > 0;
}
