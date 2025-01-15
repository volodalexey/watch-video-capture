import { MediaStorageListItems } from './components/MediaStorageListItems';
import './styles.css';
import { initI18n } from './i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/common/query/queryClient';

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
