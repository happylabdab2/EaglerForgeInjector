#!/bin/node
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');

(async () => {
    // Set up web server
    const app = express();
    const port = 3000;

    app.use(express.static('.'));
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    // Download the HTML file
    const fileUrl = 'https://github.com/Eaglercraft-Archive/unminified-eaglercraft-builds/releases/latest/download/EaglercraftX_1.8_Offline_en_US.html';
    const downloadedFilePath = path.resolve(__dirname, 'Eaglercraft-1.8.html');

    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(downloadedFilePath);
        https.get(fileUrl, (response) => {
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', reject);
    });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }); const page = await browser.newPage();

    const downloadPath = path.resolve('./');
    
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    await page.goto(`http://localhost:${port}/index.html`, {
        waitUntil: 'networkidle0'
    });

    // Click a checkbox (fix selector if needed)
    await page.click('.custom-file input[type="checkbox"]:nth-child(4)');

    // Upload the file
    const elementHandle = await page.$('input[type="file"]');
    await elementHandle.uploadFile(downloadedFilePath);

    // Handle dialog
    page.once('dialog', async (dialog) => {
        console.log('Dialog:', dialog.message());
        await dialog.accept();
    });

    // Click the build button
    await page.click('#giveme');

    // Wait for download
    await page.waitFor(5000);

    const outputFilePath = path.resolve('processed.html');
    if (fs.existsSync(outputFilePath)) {
        const content = fs.readFileSync(outputFilePath, 'utf-8');
        if (content.includes('Modapi')) {
            console.log('[1.8] File exists and contains "Modapi".');
        } else {
            console.error('[1.8] File exists but does NOT contain "Modapi".');
            throw new Error('[1.8] Output file does not contain "Modapi".');
        }
    } else {
        throw new Error('[1.8] Output file does not exist.');
    }

    await browser.close();
})();
