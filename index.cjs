const puppeteer = require('puppeteer')
const express = require('express')
const PORT = 7003
const app = express()
const cors = require('cors')
app.use(cors())

const URL = "https://prod.idp.collegeboard.org/"
const URLTWO = "https://apstudents.collegeboard.org/view-scores"
let namearr = []
let scorearr = []

const username = "" // Your collegeboard username
const pass = "" //Your collegeboard password

async function logIn(browser) {
    let page = await browser.newPage()
    console.log("Check")
    await page.goto(URL, {waitUntil: 'networkidle2'})
    await page.type('#idp-discovery-username', username)
    await page.click('#idp-discovery-submit')
    await page.waitForTimeout(7000)
    await page.type('#okta-signin-password', pass)
    await page.click('#okta-signin-submit')
    await page.waitForTimeout(10000)
    return page
}

async function grade (page) {
    await page.waitForTimeout(2000)
    await page.goto(URLTWO, {waitUntil: 'networkidle2'})

    await page.waitForTimeout(5000)
    const elements = await page.$$('.apscores-card')
    for (const element of elements) {
        const heading = await page.evaluate(el => el.querySelector('.apscores-card-heading').innerText, element)
        const score = await page.evaluate(el => el.querySelector('.apscores-badge').textContent, element)
        namearr.push(heading)
        scorearr.push(score.substring(10))
    }
}


async function output() {
    const browser = await puppeteer.launch({headless: true})
    let page = await logIn(browser)
    await grade(page)
    browser.close()
    let arr = []
    let dummy = {}
    for (let i = 0; i < namearr.length; i++) {
        let namef = namearr[i]
        let score = scorearr[i]
        Object.assign(dummy, {"Class": namef, "Score": score})
        arr.push(dummy)
        dummy = {}
    }
    app.get('/', function(req, res) {
        res.json(arr)
    })
}

output()



app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))