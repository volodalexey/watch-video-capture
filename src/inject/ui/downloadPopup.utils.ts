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
  result: BufferStorageIDBItem[],
): DownloadPopupItem[] {
  const videoSegments = result.filter((segment) => segment.isVideo);
  const audioSegments = result.filter((segment) => segment.isAudio);

  const downloadPopupItems: DownloadPopupItem[] = [];
  if (videoSegments.length) {
    videoSegments.sort(sorter);
    const detected = getExtensionByMimeType(videoSegments[0].mimeType);
    const blob = new Blob(
      videoSegments.map((r) => r.buffer),
      { type: detected?.mimeType },
    );
    const href = window.URL.createObjectURL(blob);
    downloadPopupItems.push({
      href,
      fileSize: blob.size,
      fileName: detected.extension
        ? `output.${detected.extension}`
        : 'unknown_video',
    });
  }
  if (audioSegments.length) {
    audioSegments.sort(sorter);
    const detected = getExtensionByMimeType(audioSegments[0].mimeType);
    const blob = new Blob(
      audioSegments.map((r) => r.buffer),
      { type: detected?.mimeType },
    );
    const href = window.URL.createObjectURL(blob);
    downloadPopupItems.push({
      href,
      fileSize: blob.size,
      fileName: detected.extension
        ? `output.${detected.extension}`
        : 'unknown_audio',
    });
  }

  return downloadPopupItems;
}
