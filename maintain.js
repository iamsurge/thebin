const puppeteer = require('puppeteer');
const fs = require('fs');
const { fetch, setRelays } = require('fetch-relay');
const dayjs = require('dayjs');
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const getSize = require('get-folder-size');
const { exec } = require('child_process');

dayjs.extend(timezone);
dayjs.extend(utc);

function fileSize(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}
setRelays(['https://cors-relay.vercel.app', 'https://proxy-3-one.vercel.app/', 'https://fetches-red.vercel.app', 'https://relay-1.vercel.app', 'https://relay-2.vercel.app', 'https://relay-3.vercel.app', 'https://relay-4.vercel.app', 'https://relay-5.vercel.app']);
(async () => {
    var content = ``;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.goto('https://pastebin.com/archive');
    await page.waitForSelector("a");
    const data = await page.evaluate(async () => {
      return [...document.querySelectorAll("a")].map(e => e.href)
    }).catch(err => console.log(err));
    console.log("Fetched URLs", data);
    data.forEach(async (e) => {
        if(!e.startsWith("https://pastebin.com/"))return;
        if(e.startsWith("https://pastebin.com/archive"))return;
        const id = e.slice(("https://pastebin.com/").length);
        if(!id)return;
        if(fs.existsSync(`./data/${id}.txt`))return;
        var { data, status } = await fetch({ url: `https://pastebin.com/raw/${id}` });
        if(data?.error)return;
        if(typeof data != 'string') data = JSON.stringify(data);
        fs.writeFileSync(`./data/${id}.txt`, `${data}`)
        console.log("Fetched New", id, status);
        content += `[**${id}**](/data/${id}.txt) (${dayjs().tz("Asia/Taipei").format("DD/MM/YY - HH:mm")})- ${fileSize(`./data/${id}.txt`)} bytes\n\n`;
    })
   setTimeout(async () => {
   const total = fs.readdirSync('./data').filter(file => file.endsWith('.txt'));
   content += `**Total Datas**: ${total.length}`;
   await browser.close();
    function bts(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};
   getSize('./data', (err, size) => { 
   fs.writeFileSync("./readme.md", `${content}\n\n**Total Size**: ${(size / 1024 / 1024).toFixed(2) + ' MB'} / ${bts(size)}`);
   });
   exec("node wrap.js");
   }, 5000)
})();
