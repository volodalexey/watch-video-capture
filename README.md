# Browser extension - Watch any video and capture it

## Install packages
```sh
npm i
```

## Build extension files
```sh
npm run build
```
Copy result `dist` folder to browser extensions or specify `dist` folder as unpacked extension in developer mode

## Develop mode
```sh
npm run dev
```
Above starts Vite in build and watch mode. Whenever you change files Vite will re-build all files for browser extension (hot reload impossible to implement for background scripts, only manual browser extension reload).