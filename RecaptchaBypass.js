/**
 * Description : Solving Recaptcha With Puppeteer
 * @param {any} "./utils/api"
 * @returns {any}
 */
const api = require("./utils/api");
const random = require("./utils/random");


async function Solver(page, apiKey) {
  try {
    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/anchor"]');
      return iframe && !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
    });

    let frames = await page.frames();
    const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'));

    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
    await checkbox.click({ delay: random(30, 150) });

    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      const img = iframe?.contentWindow.document.querySelector('.rc-image-tile-wrapper img');
      return img && img.complete;
    }, { timeout: 5000 });

    frames = await page.frames();
    const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'));
    const audioButton = await imageFrame.$('#recaptcha-audio-button');
    await audioButton.click({ delay: random(30, 150) });

    while (true) {
      try {
        await page.waitForFunction(() => {
          const iframe = document.querySelector('iframe[src*="api2/bframe"]');
          return !!iframe.contentWindow.document.querySelector('.rc-audiochallenge-tdownload-link');
        }, { timeout: 5000 });
      } catch (e) {
        console.error(e);
        continue;
      }

      const audioLink = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        return iframe.contentWindow.document.querySelector('#audio-source').src;
      });

      const audioBytes = await page.evaluate(audioLink => {
        return (async () => {
          const response = await window.fetch(audioLink);
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        })();
      }, audioLink);

      const response = await api(audioBytes,apiKey)

      let audioTranscript = null;
      try {
        audioTranscript = [...response.data.matchAll(/"text": "(.*?)",/g)].pop()?.[1];
      } catch (e) {
        const reloadButton = await imageFrame.$('#recaptcha-reload-button');
        await reloadButton.click({ delay: random(30, 150) });
        continue;
      }

      const input = await imageFrame.$('#audio-response');
      await input.click({ delay: random(30, 150) });
      await input.type(audioTranscript, { delay: random(30, 75) });

      const verifyButton = await imageFrame.$('#recaptcha-verify-button');
      await verifyButton.click({ delay: random(30, 150) });

      try {
        await page.waitForFunction(() => {
          const iframe = document.querySelector('iframe[src*="api2/anchor"]');
          return iframe && !!iframe.contentWindow.document.querySelector('#recaptcha-anchor[aria-checked="true"]');
        }, { timeout: 5000 });

        return page.evaluate(() => document.getElementById('g-recaptcha-response').value);
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = Solver;
