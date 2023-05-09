const config = {
    // ...
    moduleFileExtensions: [
        'js',
        'ts',
        'mjs', // add .mjs extension for ECMAScript modules
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest', // use ts-jest to transform .ts files
        '^.+\\.mjs$': 'babel-jest', // use babel-jest to transform .mjs files
    },
    testMatch: [
        '**/tests/**/*.test.(js|ts|mjs)', // include .mjs files in testMatch
    ],
};

export default config;
