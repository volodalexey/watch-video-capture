import { MediaStorageListItems } from './components/MediaStorageListItems';
import './styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/common/query/queryClient';

export function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MediaStorageListItems />
      </QueryClientProvider>
    </>
  );
}
