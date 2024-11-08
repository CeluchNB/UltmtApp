module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module:react-native-dotenv',
            {
                moduleName: '@env',
            },
        ],
        [
            'module-resolver',
            {
                alias: {
                    '@ultmt-app': './src',
                },
            },
        ],
    ],
}
