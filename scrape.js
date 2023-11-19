import puppeteer, { KnownDevices } from 'puppeteer';
const iPhone = KnownDevices['iPhone 8'];

const scrape = async function (BRANDING_LINK, appPath) {
  console.log(appPath);
  let temp = false;
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    // args: ['--no-sandbox', '--disable-setuid-sandbox'],
    args: ['--no-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();

  // await page.setCookie({
  //   name: 'cookies_enabled',
  //   value: 'true',
  //   path: '/',
  //   domain: 'auth.wi-fi.ru',
  // });

  await page.emulate(iPhone);

  console.log('before go');

  await page.goto(BRANDING_LINK, {
    timeout: 60000,
    waitUntil: 'load',
  });

  console.log('after go');

  await page
    .mainFrame()
    .waitForSelector('.branding-frame')
    .then((r) => {
      temp = true;
      // bot.sendMessage(myID, ".branding-frame detected");
    })
    .catch((err) => {
      // console.log('ERROR');
      temp = false;
      // console.log('AZAZA', err);
      return err;
      // bot.sendMessage(myID, ".branding-frame NOT detected: " + err);
    });

  if (!temp) {
    await browser.close();
    return { temp };
  }

  console.log('all ok');

  await new Promise((r) => setTimeout(r, 10000));

  const frames = page.mainFrame().childFrames();

  // frames.find((f) => {
  //   console.log(f.url());
  // });

  let ourBranding = frames.find((f) => f.url().indexOf('/branding/') > -1);

  let yadBranding = frames.find((f) => f.url().indexOf('yastatic') > -1);

  let clientName = '';

  // console.log(ourBranding);
  if (ourBranding) {
    await ourBranding
      .$eval('meta[name="client"]', (element) =>
        element.getAttribute('content')
      )
      .then((data) => {
        // clientName = data;
        clientName = data;
        // bot.sendMessage(myID, "clientName = " + clientName);
      })
      .catch((reason) => {
        // bot.sendMessage(myID, "No client name! Error = " + reason);
      });
  }

  await page.screenshot({ path: appPath + '/auth.png' });

  let brandingClick;
  await ourBranding
    .$eval('a[data-event-click="1"]', (element) => element.getAttribute('href'))
    .then((value) => {
      brandingClick = value;
      // bot.sendMessage(myID, "Branding click: " + brandingClick);
    })
    .catch((reason) => {
      // bot.sendMessage(myID, "No branding click! Error = " + reason);
    });

  console.log('before go');

  await page
    .goto(brandingClick, {
      timeout: 60000,
      waitUntil: 'load',
    })
    .then((value) => {
      brandingClick = value.url();

      // bot.sendMessage(myID, "Client page visited");
    })
    .catch((reason) => {
      // console.log(reason);
      // bot.sendMessage(
      //   myID,
      //   "Client page NOT visited! Error = " + reason
      // );
    });

  console.log('after go');

  await page.screenshot({ path: appPath + '/destination.png' });

  // Set screen size
  // await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  // await page.type('.search-box__input', 'Password Manager Compatible');

  // Wait and click on first result
  // const searchResultSelector = '.search-box__link';
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);

  // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector('text/Check and update');
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  console.log('all good');

  await browser.close();

  return { temp, clientName, brandingClick };
};

export default scrape;
