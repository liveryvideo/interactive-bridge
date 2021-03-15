// Unfortunately we have to manually copy paste the default order from:
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-ordering.md#default-configuration
const memberOrder = [
  // Index signature
  'signature',

  // Fields
  'public-static-field',
  'protected-static-field',
  'private-static-field',

  'public-decorated-field',
  'protected-decorated-field',
  'private-decorated-field',

  'public-instance-field',
  'protected-instance-field',
  'private-instance-field',

  'public-abstract-field',
  'protected-abstract-field',
  'private-abstract-field',

  'public-field',
  'protected-field',
  'private-field',

  'static-field',
  'instance-field',
  'abstract-field',

  'decorated-field',

  'field',

  // Constructors
  'public-constructor',
  'protected-constructor',
  'private-constructor',

  'constructor',

  // Methods
  'public-static-method',
  'protected-static-method',
  'private-static-method',

  'public-decorated-method',
  'protected-decorated-method',
  'private-decorated-method',

  'public-instance-method',
  'protected-instance-method',
  'private-instance-method',

  'public-abstract-method',
  'protected-abstract-method',
  'private-abstract-method',

  'public-method',
  'protected-method',
  'private-method',

  'static-method',
  'instance-method',
  'abstract-method',

  'decorated-method',

  'method',
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
      },
    },
    // TypeScript for Node consumption
    {
      // Node JS build config and test files can use devDependencies
      files: ['*.js', 'test/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
