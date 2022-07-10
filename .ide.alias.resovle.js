const resolve = (dir) => require('path').join(__dirname, dir);
module.exports = {
    extensions: ['.js', '.json', '.vue', 'ts'],
    resolve: {
        alias: {
            "~": resolve('src')
        }
    }
};