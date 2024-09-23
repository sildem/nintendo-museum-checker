import axios from "axios";
import { Browser } from "puppeteer";

async function checkAvailability(browser: Browser, dates: string[]) {
    const page = await browser.newPage();
    try {
        await page.goto('https://museum-tickets.nintendo.com/en/calendar');
        await page.waitForNetworkIdle();

        await page.setRequestInterception(true);

        let headers: any = null;

        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font') {
                request.abort();
            } else {
                if (request.resourceType() === 'xhr' && request.url().includes('https://museum-tickets.nintendo.com/en/api/calendar')) {
                    headers = request.headers();
                }
                request.continue();
            }
        });

        const firstMonthSelector = '#app > main > section > div > div.p-calendarselect > div.p-calendarselect__period > div:nth-child(1) > a';
        await page.waitForSelector(firstMonthSelector);
        await page.click(firstMonthSelector);

        await page.waitForNetworkIdle();

        const results = {};

        for (let date of dates) {
            let availableTimeSchedules = [];
            try {
                const url = `https://museum-tickets.nintendo.com/en/api/ticket/purchase/timeSchedule?target_date=${date}`;

                const response = await axios.get(url, {
                    headers: headers
                });

                const timeSchedules = response.data.data.timeSchedules;

                for (let key in timeSchedules) {
                    const timeSchedule = timeSchedules[key];
                    if (timeSchedule.displayStockStatus != 3) {
                        availableTimeSchedules.push(timeSchedule);
                    }
                }


            } catch (error) { } finally {
                results[date] = availableTimeSchedules;
            }
        }

        return results;


    } catch (error) {
        console.error(error);
    } finally {
        //await page.close();
    }
}

export { checkAvailability };
