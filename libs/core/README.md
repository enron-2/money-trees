# Core libraries

## `CustomDynamooseModule`

- Extends `DynamooseModule` to override the `forFeatureAsync` static method
- Allows the use of a provider token to inject models

## Pipes

- Located at `src/pipes`
- Used to validate inputs in `NestJs` pipes

### `EnumValidationPipe`

- Ensure value passed in is a valid enum
- Must be instantiated with a valid `enum`
- Can be made optional by setting the 2nd argument to: `{ optional: true }`

### `IdExistsPipe`

- Ensure id passed in exists in database
- Needs `nestjs-dynamoose` to be instantiated
- Used with controllers to ensure id given exists

### `RegexPipe`

- Use Regex to do simple validation
- Must be instantiated with a regex object

## Validators

- Located at `src/validators`
- Used as a property decorator to validate with `class-validator`

### `Base64Hash`

- Validates that input is a hash in base64
- Useful when validating the hashes stored by `package-lock.json`
- Needs the format: `(hash algorithm)-(hash in base64)`
- If used without passing a parameter, it will check the hash algorithm on the right hand side
- Otherwise, it will force the validation to use algorithm supplied

### `NonEmptyString`

- General purpose string validation
- Checks that input is a string, and is non-empty
- Strip whitespace and ensure length is greater than 0

## Utilities

### `normalizeAttributes`

- Takes in a class that has decorators from `class-transformer`, or a list of properties in class
- Returns a list of properties that exists
- Used to convert class into attributes list to be passed in to `nestjs-dynamoose` for projection
