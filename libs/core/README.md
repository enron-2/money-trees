# Core libraries

## Validators
- Located at `src/validators`
- Mainly used to validate inputs (obviously)
- Can be used as a decorator to validate with `class-validator`

### Base64Hash
- Validates that input is a hash in base64
- Useful when validating the hashes stored by `package-lock.json`
- Needs the format: `(hash algorithm)-(hash in base64)`
- If used without passing a parameter, it will check the hash algorithm on the right hand side
- Otherwise, it will force the validation to use algorithm supplied

### NonEmptyString
- General purpose string validation
- Checks that input is a string, and is non-empty
- Strip whitespace and ensure length is greater than 0
