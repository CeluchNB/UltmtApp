module.exports = {
    root: true,
    extends: ['@react-native-community', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
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
    },
    globals: {
        JSX: true,
    },
}
