import { registerRootComponent } from 'expo';
import { ErrorBoundary } from './ErrorBoundary';
import App from './App';

function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

registerRootComponent(Root);
