module.exports = {
    root: true,
    extends: ['@react-native-community', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'testing-library', 'jest-dom', 'jest'],
    rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'sort-imports': [
            'error',
            {
                ignoreCase: false,
                ignoreDeclarationSort: false,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
                allowSeparatedGroups: true,
            },
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'prefer-desctructuring': 'off',
        'react-hooks/exhaustive-deps': 'warn',
    },
    ignorePatterns: ['**/coverage/**/*.js'],
    globals: {
        JSX: true,
    },
}
