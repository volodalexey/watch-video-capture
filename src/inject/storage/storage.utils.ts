export function isVideoSourceBuffer(mimeType: string) {
  return mimeType.includes('video');
}

export function isAudioSourceBuffer(mimeType: string) {
  return mimeType.includes('audio');
}
