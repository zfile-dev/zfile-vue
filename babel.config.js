module.exports = {
    comments: false,
    presets: [
        '@vue/app',
    ],
    plugins: [
        [
            'component',
            {
                'libraryName': 'element-ui',
                'styleLibraryName': 'theme-chalk'
            }
        ]
    ]
};