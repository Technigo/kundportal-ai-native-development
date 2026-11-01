import { createApp } from './app.js';
import { database } from './database.js';

const port = Number(process.env.PORT ?? 3001);
const app = createApp(database);

app.listen(port, '127.0.0.1', () => {
  console.log(`API listening at http://127.0.0.1:${port}`);
});
