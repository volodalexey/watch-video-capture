import { type IndexedDBStorage } from '../IndexedDBStorage';
import { type MediaStorageItem } from '../MediaStorage';
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
) {
  if (item.sourceEndedCalled) {
    return;
  }
  item.sourceEndedCalled = true;
  indexedDbStorage.getAllByMediaIndex(item.mediaIdHash).then((result) => {
    const downloadPopupItems = prepareDownloadPopupItems(result);

    document.body.insertAdjacentHTML(
      'afterbegin',
      renderDownloadPopup(downloadPopupItems),
    );
    const dialog = document.body.children[0] as HTMLDialogElement;
    const closeButton = dialog.querySelector<HTMLButtonElement>('button');
    dialog.showModal();
    closeButton.addEventListener(
      'click',
      () => {
        dialog.close();
        dialog.remove();
      },
      { once: true },
    );
  });
}
