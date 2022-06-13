const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

module.exports = {
    input: 'build/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs'
    },
    plugins: [nodeResolve(), commonjs(), terser()]
};
