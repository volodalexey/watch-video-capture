import { access, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
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
    const manifestCommon = JSON.parse(await readFile(resolve(srcPath, './manifest.common.json'), { encoding: 'utf-8' }));
    let manifest = Object.assign({}, manifestCommon);
    const { TARGET_ENV } = process.env;
    if (TARGET_ENV === 'chromium') {
      const manifestFirefox = JSON.parse(await readFile(resolve(srcPath, './manifest.chromium.json'), { encoding: 'utf-8' }));
      Object.assign(manifest, manifestFirefox);
    } else if (TARGET_ENV === 'firefox') {
      const manifestChromium = JSON.parse(await readFile(resolve(srcPath, './manifest.firefox.json'), { encoding: 'utf-8' }));
      Object.assign(manifest, manifestChromium);
    }
    try {
      await access(distPath);
    } catch { }
    await rm(distPath, { recursive: true, force: true });
    await mkdir(distPath);
    await writeFile(join(distPath, './manifest.json'), JSON.stringify(manifest, undefined, 2), { encoding: 'utf-8' });
  } catch (err) {
    return console.error(err)
  }
  for (const entryPoint of entryPoints) {
    await build(createConfig(entryPoint));
  }
}

await start();
