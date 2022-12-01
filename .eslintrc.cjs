// Unfortunately we have to manually copy paste the default order from:
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-ordering.md#default-configuration
// Note: This is modified to group fields, getters and setters together
// and also decorated and undecorated fields and methods.
// The idea being that from the outside they are identical and refactoring to change from one
// type to the other should not result in needless moves of code and conflicts.
const memberOrder = [
  // Index signature
  'signature',
  'call-signature',

  // Fields, getters and setters
  ['public-static-field', 'public-static-get', 'public-static-set'],
  ['protected-static-field', 'protected-static-get', 'protected-static-set'],
  ['private-static-field', 'private-static-get', 'private-static-set'],
  ['#private-static-field', '#private-static-get', '#private-static-set'],

  [
    'public-decorated-field',
    'public-decorated-get',
    'public-decorated-set',
    'public-instance-field',
    'public-instance-get',
    'public-instance-set',
  ],
  [
    'protected-decorated-field',
    'protected-decorated-get',
    'protected-decorated-set',
    'protected-instance-field',
    'protected-instance-get',
    'protected-instance-set',
  ],
  [
    'private-decorated-field',
    'private-decorated-get',
    'private-decorated-set',
    'private-instance-field',
    'private-instance-get',
    'private-instance-set',
  ],

  ['#private-instance-field', '#private-instance-get', '#private-instance-set'],

  ['public-abstract-field', 'public-abstract-get', 'public-abstract-set'],
  [
    'protected-abstract-field',
    'protected-abstract-get',
    'protected-abstract-set',
  ],

  ['public-field', 'public-get', 'public-set'],
  ['protected-field', 'protected-get', 'protected-set'],
  ['private-field', 'private-get', 'private-set'],
  ['#private-field', '#private-get', '#private-set'],

  ['static-field', 'static-get', 'static-set'],
  ['instance-field', 'instance-get', 'instance-set'],
  ['abstract-field', 'abstract-get', 'abstract-set'],

  ['decorated-field', 'decorated-get', 'decorated-set', 'field', 'get', 'set'],

  // Static initialization
  'static-initialization',

  // Constructors
  'public-constructor',
  'protected-constructor',
  'private-constructor',

  'constructor',

  // Methods
  'public-static-method',
  'protected-static-method',
  'private-static-method',
  '#private-static-method',

  ['public-decorated-method', 'public-instance-method'],
  ['protected-decorated-method', 'protected-instance-method'],
  ['private-decorated-method', 'private-instance-method'],
  '#private-instance-method',

  'public-abstract-method',
  'protected-abstract-method',

  'public-method',
  'protected-method',
  'private-method',
  '#private-method',

  'static-method',
  'instance-method',
  'abstract-method',

  ['decorated-method', 'method'],
];

module.exports = {
  extends: [
    '@open-wc/eslint-config',
    // Disable formatting rules; leave that to prettier
    'prettier',
  ],
  overrides: [
    // TypeScript
    {
      files: ['**/*.ts'],
      extends: [
        '@open-wc/eslint-config',
        // Fix 'Unable to resolve path to module' (https://github.com/benmosher/eslint-plugin-import#typescript)
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        // Enable TypeScript
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        // Disable formatting rules; leave that to prettier
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.ts'],
          },
        },
      },
      rules: {
        // Increase consistency and reduce merge conflicts
        curly: ['error', 'all'],
        // Not worth the repetitive boilerplate IMHO; implicit inferred return types are fine
        '@typescript-eslint/explicit-function-return-type': 'off',
        // @open-wc's JS based rule (always include extensions) conflicts with @typescript-eslint's TS based rule
        'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
        // Not sure why this is not handled by @typescript-eslint/recommended already
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        // I don't think it's wrong to assign values to properties of parameters
        'no-param-reassign': ['error', { props: false }],
        // TypeScript 3.9 already checks for presence of super methods
        'wc/guard-super-call': 'off',
        // We prefer to use type inference instead of explicit return types
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // Use @typescript-eslint no-use-before-define (disable plain one) to allow cyclic type declarations
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'error',
        // Just show errors when non-basic objects are concatenated (e.g: resulting in unreadable: [object Object])
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          { allowBoolean: true, allowNumber: true, allowNullish: true },
        ],
        // Order members by default order and alphabetically
        '@typescript-eslint/member-ordering': [
          'error',
          { default: { memberTypes: memberOrder, order: 'alphabetically' } },
        ],
        // Don't use `public` TS accessibility syntax
        // TODO: also disable `private` and use JS `#private` fields instead at some point
        // Note: TS decorators can't be used with #private fields yet
        // Note: @typescript-eslint/member-ordering might not support that; add eslint-plugin-sort-class-members?
        // Note: #private fields probably depend on eslint v8 which is not yet supported by @open-wc/eslint-config
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { accessibility: 'no-public' },
        ],
        // It's not a big problem most of the time and in OO override situations it should not complain anyhow
        'class-methods-use-this': 'off',
        // Enable autofix to use `import type` when possible
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            disallowTypeAnnotations: false,
          },
        ],
      },
    },
    // TypeScript for Node consumption
    {
      // Node JS build config and test files can use devDependencies
      files: ['*.js', '*.cjs', 'tests/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
