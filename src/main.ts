import { App } from './app';

navigator.storage?.persist?.();

// Prevent back gesture from exiting the PWA
history.pushState(null, '', location.href);
window.addEventListener('popstate', () => {
  history.pushState(null, '', location.href);
});

const app = new App();
app.init();
