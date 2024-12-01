import { type DownloadPopupItem } from './downloadPopup.types';

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
