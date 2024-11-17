import { MediaSegment } from '../storage/storage.types';

export function calcMediaSegment(sourceBuffer: SourceBuffer) {
  const mediaSegment: MediaSegment = {
    from: 0,
    to: sourceBuffer.timestampOffset,
  };
  if (sourceBuffer.buffered.length > 0) {
    const timeRangeIndex = 0;
    mediaSegment.from = sourceBuffer.buffered.start(timeRangeIndex);
    mediaSegment.to = sourceBuffer.buffered.end(timeRangeIndex);
  }
  return mediaSegment;
}

export function isInSourceBuffers(
  mediaSource: MediaSource,
  sourceBuffer: SourceBuffer,
) {
  return (
    Array.prototype.indexOf.call(mediaSource.sourceBuffers, sourceBuffer) > -1
  );
}
