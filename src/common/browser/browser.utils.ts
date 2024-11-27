export function mockBrowser() {
  if (
    typeof globalThis.browser === 'undefined' &&
    typeof globalThis.chrome !== 'undefined'
  ) {
    globalThis.browser = globalThis.chrome;
  }
}

export function hashCode(str: string) {
  return String(
    str
      .split('')
      .reduce(
        (prevHash, currVal) =>
          ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
        0,
      ),
  );
}
