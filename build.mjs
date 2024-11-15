import { access, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build, defineConfig } from 'vite';

const SrcDirname = 'src';
const DistDirname = 'dist';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcPath = resolve(__dirname, SrcDirname);
const distPath = resolve(__dirname, DistDirname);

const entryPoints = [
  { inputName: 'background', inputPath: resolve(srcPath, 'background/index.ts') },
  { inputName: 'content', inputPath: resolve(srcPath, 'content/index.ts') },
  { inputName: 'inject', inputPath: resolve(srcPath, 'inject/index.ts') },
  { inputName: 'options', inputPath: resolve(srcPath, 'options/index.html'), outputDirname: 'options' },
  { inputName: 'popup', inputPath: resolve(srcPath, 'popup/index.html'), outputDirname: 'popup' },
];

const isWatch = process.argv.some(arg => arg.includes('--watch'));

function createConfig({ inputName, inputPath, outputDirname }) {
  return defineConfig({
    base: './',
    root: `${SrcDirname}${outputDirname ? `/${outputDirname}` : ''}`,
    resolve: {
      alias: {
        '@': srcPath,
      },
    },
    build: {
      watch: isWatch,
      minify: false,
      terserOptions: {
        compress: false,
        mangle: false,
      },
      rollupOptions: {
        input: {
          [inputName]: inputPath,
        },
        output: {
          inlineDynamicImports: true,
          entryFileNames: '[name].bundle.js',
          chunkFileNames: '[name].chunk.js',
          assetFileNames: '[name][extname]',
        },
      },
      outDir: `${distPath}${outputDirname ? `/${outputDirname}/` : ''}`,
    },
    publicDir: 'public',
    plugins: [],
  });
}

async function start() {
  try {
    await access(distPath);
    await rmdir(distPath, { recursive: true, force: true });
  } catch {}
  for (const entryPoint of entryPoints) {
    await build(createConfig(entryPoint));
  }
}

await start();
