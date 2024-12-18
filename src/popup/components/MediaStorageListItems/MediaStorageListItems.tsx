import { TSerializedMediaStorageItem } from '@/common/message';
import { MediaStorageListItem } from '../MediaStorageListItem';

export type MediaStorageListItemsProps = {
  items: TSerializedMediaStorageItem[];
};

export function MediaStorageListItems({ items }: MediaStorageListItemsProps) {
  return (
    <ul>
      {items.map((item) => (
        <MediaStorageListItem item={item} />
      ))}
    </ul>
  );
}
