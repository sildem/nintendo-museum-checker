import dotenv from 'dotenv';
import puppeteer, { Browser } from 'puppeteer';
import { app } from './server';

dotenv.config();

const browserOptions = {
  headless: process.env.HEADLESS_BROWSER != null ? process.env.HEADLESS_BROWSER == 'true' : true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  timeout: 120000,
};

export let browser: Browser;

const port = process.env.PORT;


async function main() {
  browser = await puppeteer.launch(browserOptions);

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

main();
