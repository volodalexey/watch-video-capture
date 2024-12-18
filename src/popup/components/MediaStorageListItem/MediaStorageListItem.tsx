import { TSerializedMediaStorageItem } from '@/common/message';

export type MediaStorageListItemProps = {
  item: TSerializedMediaStorageItem;
};

export function MediaStorageListItem({ item }: MediaStorageListItemProps) {
  return <li>{item.mediaId}</li>;
}
