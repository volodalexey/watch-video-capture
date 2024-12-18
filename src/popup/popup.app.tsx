import { createRoot } from 'react-dom/client';
import { mockBrowser } from '../common/browser';
import { App } from './App';

mockBrowser();

function start() {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<App />);
}

start();
