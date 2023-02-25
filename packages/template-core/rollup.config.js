import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';
import svgr from '@svgr/rollup';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import less from 'rollup-plugin-less';

export default {
  input: ['src/index.ts'],
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    typescript(),
    less({ include: ['**/*.less'], output: './dist/custom.css' }),
    css({
      // Optional: filename to write all styles to
      output: 'tailwind.css',
    }),
    image(),
    svgr(),
    commonjs(),
    babel({
      babelrc: false,
      babelHelpers: 'bundled',
      plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
    }),
  ],
  external: ['react', 'antd'],
};
