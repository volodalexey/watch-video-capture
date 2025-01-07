export function getOriginUrl() {
  const { hash, search, href } = globalThis.location;
  return href.replace(hash, '').replace(search, '');
}
