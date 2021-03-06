/**
 * Created by ciprian on 3/30/17.
 */

var webPage = require('webpage');
var system = require('system');
var page = webPage.create();
var fs = require('fs');

var CookieJar = "cookiejar.json";
var pageResponses = {};
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false;
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;


var pathToCrawler = system.env.SWARM_PATH+"/crawler/";
var config = JSON.parse(fs.read(pathToCrawler+"urls.json"));



function changeCookieJar(network){
    return function() {
        phantom.clearCookies();
        var existingCookies =JSON.parse(fs.read(pathToCrawler+"cookiejar."+network+".json"));
        existingCookies.forEach(function(cookie){
            phantom.addCookie(cookie);
        })
        page.onResourceReceived = function (response) {
            pageResponses[response.url] = response.status;
            fs.write(pathToCrawler+"cookiejar."+network+".json", JSON.stringify(phantom.cookies, null, 4), "w");
        };
    }
}

page.onResourceReceived = function (response) {
    pageResponses[response.url] = response.status;
    fs.write(CookieJar, JSON.stringify(phantom.cookies), "w");
};
page.onResourceError = function(resourceError) {
    console.log(resourceError.url + ': ' + resourceError.errorString);
};
page.onLoadStarted = function() {
    loadInProgress = true;
};
page.onLoadFinished = function() {
    loadInProgress = false;
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log(msg);
}

function openUrl(name,url){
    return function() {
        console.log(JSON.stringify({status:"fetching", name:name,url:url}));
        page.open(url, function (status) {
            if (status === "success") {
                console.log(JSON.stringify({status:"success", name:name,url:url}));
            } else {
                console.log(JSON.stringify({status:"error", name:name,url:url}));
            }
        })
    }
}



var waiting = false;
function wait(num_miliseconds){
    return function(){
        waiting = true;
        //console.log("Waiting");
        window.setTimeout(function(){
            waiting = false;
            //console.log("Done waiting");
        },num_miliseconds?num_miliseconds:2000)
    }
}

var predefinedFunctions = {
    loginToFacebook: function () {
        page.evaluate(function () {
            document.querySelector("input[name='email']").value = "plusprivacycrawler@plusprivacy.com";
            document.querySelector("input[name='pass']").value = "privacycrawler";
            document.querySelector("#login_form").submit();
        });
    },
    loginToLinkedin:function () {
        page.evaluate(function () {
            document.getElementById('session_key-login').value = "plusprivacycrawler@plusprivacy.com";
            document.getElementById('session_password-login').value = "privacycrawler";
        });
        wait()()
        page.evaluate(function () {
            document.getElementById('btn-primary').click();
        })
    },
    loginToTwitter:function () {
        page.evaluate(function () {
            document.getElementById('signin-email').value = "plusprivacycrawler@plusprivacy.com";
            document.getElementById('signin-password').value = "privacycrawler";
            document.getElementsByClassName("submit btn primary-btn flex-table-btn js-submit")[0].click()
        });
    },
    insertGoogleEmail:function () {
        page.evaluate(function () {
            document.getElementById("identifierId").value = "jon.crawlson@gmail.com";
            document.getElementById("identifierNext").click();
        });
        wait()();
    },
    insertGooglePassword:function(){
        page.evaluate(function () {
            document.getElementsByName('password')[0].value = "privacycrawler";
        });
        page.evaluate(function () {
            document.getElementById("passwordNext").click();
        });
        wait()();
    },
    clearCookies:phantom.clearCookies,
    wait:wait
}

var steps=[];
var testindex = 0;
var loadInProgress = false;//This is set to true when a page is still loading



function readPage(name){
    return function() {
        page.render(pathToCrawler+name+".png",{format:"png"});
    }
}

steps = [];

for(var network in config){
    steps.push(changeCookieJar(network));
    config[network].forEach(function(crawlStep,index){
        if(crawlStep.exec){
            steps.push(predefinedFunctions[crawlStep.exec])
        }
        else{
            steps.push(openUrl(crawlStep.name,crawlStep.url));
            if(crawlStep.takeScreenshot!==false){
                steps.push(predefinedFunctions.wait);
                steps.push(readPage(crawlStep.name));
            }
        }
        steps.push(wait);
    });
}

setInterval(executeRequestsStepByStep,100);
function executeRequestsStepByStep(){
    if(waiting === true){
        return;
    }

    if (loadInProgress == false) {
        steps[testindex]();
        testindex++;
    }

    if (typeof steps[testindex] != "function") {
        console.log("Crawling complete!");
        phantom.exit();
    }
}
