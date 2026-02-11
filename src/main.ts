import { App } from './app';

navigator.storage?.persist?.();

const app = new App();
app.init();
