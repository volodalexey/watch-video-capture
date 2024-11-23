import { type MediaSegment } from '../MediaStorage';

export function calcMediaSegment(sourceBuffer: SourceBuffer) {
  const mediaSegment: MediaSegment = {
    from: 0,
    to: 0,
    timestampOffset: sourceBuffer.timestampOffset,
  };
  if (sourceBuffer.buffered.length > 0) {
    const timeRangeIndex = 0;
    mediaSegment.from = sourceBuffer.buffered.start(timeRangeIndex);
    mediaSegment.to = sourceBuffer.buffered.end(timeRangeIndex);
  }
  return mediaSegment;
}

export function printTimeRanges(timeRanges: TimeRanges) {
  const total: Array<[number, number]> = [];
  for (let i = 0; i < timeRanges.length; i++) {
    const start = timeRanges.start(i);
    const end = timeRanges.end(i);
    total.push([start, end]);
  }
  return total.map(([start, end]) => `[${start}:${end}]`).join(' ');
}

export function isInSourceBuffers(
  mediaSource: MediaSource,
  sourceBuffer: SourceBuffer,
) {
  return (
    Array.prototype.indexOf.call(mediaSource.sourceBuffers, sourceBuffer) > -1
  );
}

export function isVideoSourceBuffer(mimeType: string) {
  return mimeType.includes('video');
}

export function isAudioSourceBuffer(mimeType: string) {
  return mimeType.includes('audio');
}
