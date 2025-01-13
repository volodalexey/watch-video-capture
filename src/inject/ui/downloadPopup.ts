import { getFullBufferItems, type IndexedDBStorage } from '../IndexedDBStorage';
import { setDownloadPopupOpen, type MediaStorageItem } from '../MediaStorage';
import { type DownloadPopupItem } from './downloadPopup.types';
import { prepareDownloadPopupItems } from './downloadPopup.utils';

export function renderDownloadPopup(items: DownloadPopupItem[]) {
  return `<dialog>
    <button type="button">❎</button>
    <ul>
      ${items
        .map(({ fileName, href }) => {
          return `<li>
          <a href="${href}" download="${fileName}">💾${fileName}</a>
        </li>`;
        })
        .join('<hr />')}
    </ul>
  </dialog>`;
}

export function showDownloadPopup(
  indexedDbStorage: IndexedDBStorage,
  item: MediaStorageItem,
  trustedTypePolicy?: TrustedTypePolicy,
) {
  if (item.downloadPopupOpen) {
    return;
  }
  setDownloadPopupOpen(item, true);

  getFullBufferItems(indexedDbStorage, item.mediaIdHash)
    .then((result) => {
      const downloadPopupItems = prepareDownloadPopupItems(result);
      const rawHTML = renderDownloadPopup(downloadPopupItems);

      document.body.insertAdjacentHTML(
        'afterbegin',
        trustedTypePolicy
          ? (trustedTypePolicy.createHTML(rawHTML) as unknown as string)
          : rawHTML,
      );
      const dialog = document.body.children[0] as HTMLDialogElement;
      const closeButton = dialog.querySelector<HTMLButtonElement>('button');
      dialog.showModal();
      closeButton.addEventListener(
        'click',
        () => {
          dialog.close();
          dialog.remove();
          setDownloadPopupOpen(item, false);
        },
        { once: true },
      );
    })
    .catch((err) => {
      setDownloadPopupOpen(item, false);
      console.error(err);
    });
}
