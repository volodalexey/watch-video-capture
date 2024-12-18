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
