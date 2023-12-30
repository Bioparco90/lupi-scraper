import { launch } from 'puppeteer';
import { writeFile, readFileSync } from 'fs';
import notifier from 'node-notifier';
import { exec } from 'child_process';

const createNotify = () => {
    notifier.notify({
        title: "New chapter available",
        message: 'A new chapter has been uploaded',
        icon: 'icons/Luffys-flag.256.png',
        sound: true,
        wait: true
    });

    notifier.on('click', function (notifierObject, options, event) {
       exec('start https://lupiteam.net/comics/one-piece');
    });
}

const getChapter = async () => {
    const browser = await launch();
    const page = await browser.newPage();

    try {
        await page.goto('https://lupiteam.net/comics/one-piece', { waitUntil: 'domcontentloaded' });

        // Wait for element with specified selector be ready
        await page.waitForSelector('span[title="Last chapter"]');

        const result = await page.evaluate(() => {
            const div = document.querySelector('.text-success');
            if (div) {
                const anchor = div.querySelector('a');

                return {
                    lastChapter: anchor ? anchor.innerHTML : null,
                };
            }
            return null;
        });

        return result;

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
};

// Creating JSON 
// const data = JSON.stringify({ title: lastChapter });
// writeFile("lastChapter.json", data, err => err ? console.log(err) : null);

(async () => {
    const { lastChapter } = await getChapter();

    try {
        let prevData;
        try {
            prevData = readFileSync("lastChapter.json");
        } catch (e) {
            const data = JSON.stringify({ title: null });
            writeFile("lastChapter.json", data, err => err ? console.log(err) : null);
            prevData = data;
        }
        // const prevData = readFileSync("lastChapter.json");
        const { title } = JSON.parse(prevData);
        if (lastChapter !== title) {
            // Creating JSON 
            const data = JSON.stringify({ title: lastChapter });
            writeFile("lastChapter.json", data, err => err ? console.log(err) : null);
            createNotify();
        }
    } catch (error) {
        console.log(error.message);
    }
})();
