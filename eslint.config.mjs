import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default [
    js.configs.recommended,

    ...tseslint.configs.recommended,
    {
        plugins: {
            prettier: prettier,
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',

            '@typescript-eslint/explicit-member-accessibility': 'off',

            // Disables the rule that enforces explicit return types for exported functions.
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // Disables the rule that requires a prefix (e.g., 'I') for interface names.
            '@typescript-eslint/interface-name-prefix': 'off',

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: ['class', 'interface', 'typeAlias', 'enum'],
                    format: ['PascalCase'],
                },
                {
                    selector: ['classMethod', 'function'],
                    format: ['camelCase'],
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                },
            ],

            // Disables the rule that bans the use of the 'any' type.
            '@typescript-eslint/no-explicit-any': 'off',

            'prettier/prettier': [
                'error',
                {
                    printWidth: 80,
                    tabWidth: 4,
                    useTabs: false,
                    singleQuote: true,
                    trailingComma: 'all',
                    arrowParens: 'always',
                    semi: true,
                    endOfLine: 'auto',
                },
            ],
        },
    },
];