import { MimeTypeToExtension } from './browser.constants';

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

export function getExtensionByMimeType(
  mimeType: string,
): { extension: string; mimeType: string } | null {
  const searchMimeType = mimeType.toLowerCase();
  const found = Object.entries(MimeTypeToExtension).find(([iterMimeType]) =>
    searchMimeType.includes(iterMimeType),
  );
  if (found) {
    return { extension: found[1], mimeType: found[0] };
  }
  return null;
}
