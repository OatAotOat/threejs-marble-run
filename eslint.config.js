import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import stylistic from '@stylistic/eslint-plugin'
import importX from 'eslint-plugin-import-x'

export default [
    js.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    {
        files: [ 'src/**/*.{js,jsx}' ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
        settings: {
            react: { version: 'detect' },
        },
        plugins: {
            'react-hooks': reactHooks,
            '@stylistic': stylistic,
            'import-x': importX,
        },
        rules: {
            /**
             * Correctness
             */
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'import-x/no-unresolved': [ 'error', { ignore: [ '^[^.]' ] } ],
            'no-unused-vars': [ 'error', { args: 'after-used' } ],

            // React Three Fiber elements use three.js props (position, castShadow, args...)
            'react/no-unknown-property': 'off',
            'react/prop-types': 'off',

            /**
             * Style
             */
            '@stylistic/indent': [ 'error', 4, { SwitchCase: 1 } ],
            '@stylistic/brace-style': [ 'error', '1tbs', { allowSingleLine: true } ],
            '@stylistic/quotes': [ 'error', 'single', { avoidEscape: true } ],
            '@stylistic/jsx-quotes': [ 'error', 'prefer-double' ],
            '@stylistic/semi': [ 'error', 'never' ],
            '@stylistic/keyword-spacing': 'error',
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/arrow-parens': [ 'error', 'always' ],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/key-spacing': 'error',
            '@stylistic/object-curly-spacing': [ 'error', 'always' ],
            '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
            '@stylistic/template-curly-spacing': [ 'error', 'always' ],
            '@stylistic/jsx-curly-spacing': [ 'error', { when: 'always', children: true } ],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': [ 'error', { max: 1 } ],
            '@stylistic/eol-last': 'error',
        },
    },
]
