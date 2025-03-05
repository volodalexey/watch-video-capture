import { queryClient } from '@/common/query/queryClient';

import './styles.css';

import { QueryClientProvider } from '@tanstack/react-query';

import { MediaStorageListItems } from './components/MediaStorageListItems';
import { initI18n } from './i18n';

initI18n();

export function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MediaStorageListItems />
      </QueryClientProvider>
    </>
  );
}
