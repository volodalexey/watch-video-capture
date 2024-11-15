import { createRoot } from 'react-dom/client';
import './styles.css';
import { OptionsHeader } from './OptionsHeader';
import { OptionsBody } from './OptionsBody';
import { mockBrowser } from '../common/browser';

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
