import { createRoot } from 'react-dom/client';

import './styles.css';
import { mockBrowser } from '../common/browser';
import { OptionsBody } from './OptionsBody';
import { OptionsHeader } from './OptionsHeader';

mockBrowser();

function App() {
  return (
    <>
      <OptionsHeader />
      <OptionsBody />
    </>
  );
}

function start() {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<App />);
}

start();
