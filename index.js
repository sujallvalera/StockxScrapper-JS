
const puppeteer = require('puppeteer');
var html2json = require('html2json').html2json;
const userAgent = require('user-agents');
const prompt = require("prompt-sync")();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let askProduct = prompt('Enter your product/link: ');
// checking if the user entered the product link or the product name
if(askProduct.startsWith('https://stockx.com/')){

    async function stockx() {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        // setting user agents to bypass rate limits (captcha could come on many entries)
        await page.setUserAgent(userAgent.random().toString());
        await page.goto(askProduct);
        await sleep(1000)
        try{
        // taking out the html
        let priceContainer = await page.$('.css-wpoilv')
        let html = (await (await priceContainer.getProperty('outerHTML')).jsonValue());
        // conversion of html to json
        let json = html2json(html);
        // mapping elements/prices
        let price = json.child[0].child[1].child[0]['text'];
        console.log('Price: ', price);
        let downArrow = json.child[0].child[2].child[0].child[0]['text']
        let priceChange = json.child[0].child[2].child[1].child[0]['text']
        let percentageChange = json.child[0].child[2].child[2].child[0]['text']
        console.log('Price Change: ', downArrow, priceChange, percentageChange);
        await browser.close();
        }
        catch(err){
            console.log("Invalid link.")
        }
    }
    stockx();
}
else{
    // product name check
    // creating a json to bifurcate all the elements
    let productInfoJSON = {"productLink": [], "productImage": [], "name": [], "price":[]}
    let searchProduct = askProduct.replaceAll(" ", "+")
    async function stockx() {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setUserAgent(userAgent.random().toString());
        await page.goto("https://stockx.com/search?s=" + searchProduct);
        await sleep(1000)

        try{
        // taking out the html
        let priceContainers = await page.$$('.css-111hzm2-GridProductTileContainer')
        for(priceContainer of priceContainers){
            let html = (await (await priceContainer.getProperty('outerHTML')).jsonValue());
            // conversion of html to json
            let json = html2json(html);
            let href = json.child[0].child[0].child[0].attr['href']
            productInfoJSON['productLink'].push(href);
            let imgLink = json.child[0].child[0].child[0].child[0].child[0].child[0].child[0].attr['src']
            productInfoJSON['productImage'].push(imgLink);
            let productName = json.child[0].child[0].child[0].child[0].child[0].child[0].child[0].attr['alt'].join(' ');
            productInfoJSON['name'].push(productName);
            let productPrice = json.child[0].child[0].child[0].child[0].child[1].child[1].child[1].child[0].child[0]['text'];
            productInfoJSON['price'].push(productPrice);
        }
        
        console.log(productInfoJSON)
        // logs the first 3 elems you can hash all the below code and use the json
        for(let i = 0; i<3; i++){
            console.log(`Product ${i+1}:-`)
            console.log('Name: ', productInfoJSON['name'][i]);
            console.log('Price(Lowest Ask): ', productInfoJSON['price'][i]);
            console.log('Image URL: ', productInfoJSON['productImage'][i]);
            console.log("https://stockx.com" + productInfoJSON['productLink'][i])
        }
        await browser.close();
        }
        catch(err){
            console.log("Couldn't find a product named - " + askProduct)
        }
        //css-111hzm2-GridProductTileContainer
    }
    stockx();
}

