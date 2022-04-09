import { EntityType } from './entity';
import { PackageEntity } from './package';
import { createHash } from 'crypto';

describe('Package entity loader', () => {
  it('should create successfully', () => {
    const entity = PackageEntity.fromDocument({
      type: EntityType.Package,
      version: '4.2.0',
      name: 'some-pkg',
      checksum:
        'sha512-' + createHash('sha512').update('Hello there').digest('base64'),
      url: 'https://some-site.com',
    });
    expect(entity).toBeDefined();
    expect(entity).toBeInstanceOf(PackageEntity);
    const expectedKey = 'PKG#some-pkg#4.2.0';
    expect(entity.id).toBe(expectedKey);
    expect(entity.keys()).toMatchObject({ pk: expectedKey, sk: expectedKey });
  });

  it('should create successfully with type as using string', () => {
    const entity = PackageEntity.fromDocument({
      type: 'Package' as any,
      version: '4.2.0',
      name: 'some-pkg',
      checksum:
        'sha512-' + createHash('sha512').update('Hello there').digest('base64'),
      url: 'https://some-site.com',
    });
    expect(entity).toBeDefined();
    expect(entity.type).toBe(EntityType.Package);
  });

  it('should serialize with correct fields', () => {
    const entity = PackageEntity.fromDocument({
      type: EntityType.Package,
      version: '4.2.0',
      name: 'some-pkg',
      checksum:
        'sha512-' + createHash('sha512').update('Hello there').digest('base64'),
      url: 'https://some-site.com',
    });
    expect(entity.toPlain()).toEqual({
      id: 'PKG#some-pkg#4.2.0',
      name: 'some-pkg',
      version: '4.2.0',
      checksum:
        'sha512-' + createHash('sha512').update('Hello there').digest('base64'),
      url: 'https://some-site.com',
    });
  });

  it('should not create when pk supplied does not match content', () => {
    const entity = () =>
      PackageEntity.fromDocument({
        pk: 'yeet!',
        type: 'Package' as any,
        version: '4.2.0',
        name: 'some-pkg',
        checksum:
          'sha512-' +
          createHash('sha512').update('Hello there').digest('base64'),
        url: 'https://some-site.com',
      });
    expect(entity).toThrowError('pk supplied mismatch');
  });

  it('should not create successfully', () => {
    const entity = () =>
      PackageEntity.fromDocument({
        type: 'yeet' as any,
        version: '4.2.0',
        name: 'some-pkg',
        checksum: 'sha512-fake-hash-lol',
        url: 'https://some-site.com',
      });
    expect(entity).toThrowError();
  });
});
