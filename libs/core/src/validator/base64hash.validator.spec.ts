import { plainToInstance } from 'class-transformer';
import { Validator } from 'class-validator';
import { createHash } from 'crypto';
import { IsBase64Hash } from './base64hash.validator';

class AnyHash {
  @IsBase64Hash()
  field: string;
}

class Sha256Hash {
  @IsBase64Hash('sha256')
  field: string;
}

const hasher = {
  sha512: () => createHash('sha512'),
  sha256: () => createHash('sha256'),
  sha1: () => createHash('sha1'),
};

const validator = new Validator();

describe('Base64 Hash String Validator', () => {
  it('Any base64 hash', () => {
    const { sha1, sha256, sha512 } = hasher;
    const input = plainToInstance(AnyHash, [
      { field: `sha1-${sha1().update('yeet me 10ft').digest('base64')}` },
      { field: `sha256-${sha256().update('yeet me 10ft').digest('base64')}` },
      { field: `sha512-${sha512().update('yeet me 10ft').digest('base64')}` },
    ]);
    expect(input.map((i) => validator.validateSync(i)).flat().length).toBe(0);
  });

  it('SHA256 base64 hash', () => {
    const { sha256 } = hasher;
    const input = plainToInstance(Sha256Hash, [
      {
        field: `SomethingInTheWay-${sha256()
          .update('yeet me 10ft')
          .digest('base64')}`,
      },
      { field: `sha256-${sha256().update('yeet me 10ft').digest('base64')}` },
      { field: `sha512-${sha256().update('yeet me 10ft').digest('base64')}` },
      { field: `sha420-${sha256().update('yeet me 10ft').digest('base64')}` },
    ]);
    expect(input.map((i) => validator.validateSync(i)).flat().length).toBe(0);
  });

  it('Mismatch SHA256 base64 hash', () => {
    const { sha1, sha512 } = hasher;
    const input = plainToInstance(Sha256Hash, [
      { field: `sha256-${sha1().update('yeet me 10ft').digest('base64')}` },
      { field: `sha256-${sha512().update('yeet me 10ft').digest('base64')}` },
    ]);
    expect(input.map((i) => validator.validateSync(i)).flat().length).toBe(2);
  });

  it('Any non-base64 hash', () => {
    const { sha1, sha256, sha512 } = hasher;
    const input = plainToInstance(AnyHash, [
      { field: `sha1-${sha1().update('yeet me 10ft').digest('hex')}` },
      { field: `sha256-${sha256().update('yeet me 10ft').digest('hex')}` },
      { field: `sha512-${sha512().update('yeet me 10ft').digest('hex')}` },
    ]);
    expect(input.map((i) => validator.validateSync(i)).flat().length).toBe(3);
  });
});
