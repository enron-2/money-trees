import { ClassConstructor, plainToInstance } from 'class-transformer';

type AttributeType<T> =
  | Record<keyof T, unknown>
  | Array<keyof T>
  | ClassConstructor<T>;

export function normalizeAttributes<T>(
  attributes: AttributeType<T>
): string[] | Array<keyof T> {
  if (Array.isArray(attributes)) return attributes as string[];
  if (typeof attributes === 'function')
    return Object.keys(
      plainToInstance(attributes, {}, { exposeUnsetFields: true })
    );
  return Object.keys(attributes);
}
