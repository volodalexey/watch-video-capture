import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <>
      Popup
    </>
  );
}

function start() {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<App />);
}

start();
