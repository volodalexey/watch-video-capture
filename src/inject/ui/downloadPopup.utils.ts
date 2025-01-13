import { getExtensionByMimeType } from '@/common/browser';
import { type BufferStorageIDBItem } from '../IndexedDBStorage';
import { type DownloadPopupItem } from './downloadPopup.types';

function sorter(a: BufferStorageIDBItem, b: BufferStorageIDBItem) {
  const isARaw = !a.isView;
  const isBRaw = !b.isView;
  if (isARaw && isBRaw) {
    return a.rawByteOffset - b.rawByteOffset;
  } else if (isARaw && !isBRaw) {
    return 1;
  } else if (!isARaw && isBRaw) {
    return -1;
  }
  return a.viewByteOffset - b.viewByteOffset;
}

export function prepareDownloadPopupItems(
  result: Record<string, BufferStorageIDBItem[]>,
): DownloadPopupItem[] {
  const downloadPopupItems: DownloadPopupItem[] = [];
  for (const mimeType of Object.getOwnPropertyNames(result)) {
    const segments = result[mimeType];
    if (segments.length) {
      segments.sort(sorter);
      const detected = getExtensionByMimeType(segments[0].mimeType);
      if (!detected) {
        throw new Error(
          `Unable to detect extension by mime type = ${segments[0].mimeType}`,
        );
      }
      const blob = new Blob(
        segments.map((r) => r.buffer),
        { type: detected?.mimeType },
      );
      const href = window.URL.createObjectURL(blob);
      downloadPopupItems.push({
        href,
        fileSize: blob.size,
        fileName: detected.extension
          ? `output.${detected.extension}`
          : segments[0].isVideo
            ? 'unknown_video'
            : 'unknown_audio',
      });
    }
  }

  return downloadPopupItems;
}
