/*
 * Copyright (c) 2016 ROMSOFT.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the The MIT License (MIT).
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *    RAFAEL MASTALERU (ROMSOFT)
 * Initially developed in the context of OPERANDO EU project www.operando.eu
 */

var webRequest = chrome.webRequest;
var HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options'
];

var DependencyManager = require("DependencyManager").DependencyManager;
var bus = require("bus-service").bus;

webRequest.onHeadersReceived.addListener(
    function (details) {
        return {
            responseHeaders: details.responseHeaders.filter(function (header) {
                return HEADERS_TO_STRIP_LOWERCASE.indexOf(header.name.toLowerCase()) < 0;
            })
        };
    }, {
        urls: ["<all_urls>"]
    }, ["blocking", "responseHeaders"]);


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.message === "getCookies") {
        if (message.url) {
            chrome.cookies.getAll({url: message.url}, function (cookies) {
                sendResponse(cookies);
            });

            return true;
        }
    }

    if (message.message === "waitForAPost") {
        if (message.template) {

            webRequest.onBeforeRequest.addListener(function waitForPost(request) {
                    if (request.method == "POST") {
                        var requestBody = request.requestBody;
                        if (requestBody.formData) {
                            var formData = requestBody.formData;
                            for (var prop in message.template) {
                                if (formData[prop]) {
                                    if(formData[prop] instanceof Array){
                                        message.template[prop] = formData[prop][0];
                                    }
                                    else{
                                        message.template[prop] = formData[prop];
                                    }
                                }
                            }

                            webRequest.onBeforeRequest.removeListener(waitForPost);
                            sendResponse ({template:message.template});
                        }
                    }

                },
                {urls: ["*://www.facebook.com/*"]},
                ["blocking", "requestBody"]);
        }
        return true;
    }

});

webRequest.onBeforeSendHeaders.addListener(function(details) {

        var referer = "";
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            var header = details.requestHeaders[i];
            if (header.name === "X-Alt-Referer") {
                referer = header.value;
                details.requestHeaders.splice(i, 1);
                break;
            }
        }
        if (referer !== "") {
            for (var i = 0; i < details.requestHeaders.length; ++i) {
                var header = details.requestHeaders[i];
                if (header.name === "Referer") {
                    details.requestHeaders[i].value = referer;
                    break;
                }
            }
        }

        return {requestHeaders: details.requestHeaders};

    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);


webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if(details['url'].indexOf("https://www.facebook.com/ajax/settings/apps/delete_app.php")>=0){

            for (var i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === "Origin") {
                    details.requestHeaders[i].value = "https://www.facebook.com";
                    break;
                }
            }
            details.requestHeaders.push({
                name:"referer",
                value:"https://www.facebook.com/settings?tab=applications"
            });
        }

        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["*://www.facebook.com/*"]},
    ["blocking", "requestHeaders"]);


chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        var feedbackFormUrl = CONSTANTS.FEEDBACK_FORM_URL + "/formResponse";
        if(details.url.indexOf(feedbackFormUrl)>-1){
            swarmHub.startSwarm("notification.js","registerInZone", "FEEDBACK_SUBMITTED");
        }
        return {cancel: false};
    },
    {urls: ["*://docs.google.com/*"]},
    ["blocking"]);


chrome.storage.local.get("deviceId",function(response){
    if(!response.deviceId) {
        response.deviceId = new Date().getTime().toString(16) + Math.floor(Math.random() * 10000).toString(16);
    }
    chrome.runtime.setUninstallURL(ExtensionConfig.UNINSTALL_URL+response.deviceId);
});

/*
//prevent fringerprinting

function prevent_fingerprinting(tab) {
    insertJavascriptFile(tab.id, "/operando/modules/fingerprinting/prevent.js", function () {
    });
    webRequest.onBeforeSendHeaders.addListener(
        function(details) {

            for (var i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === "User-Agent") {
                    details.requestHeaders[i].value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
                }

                if (details.requestHeaders[i].name === "Accept-Language") {
                    details.requestHeaders[i].value = "en-US";
                }
            }

            console.log(details.requestHeaders);
            return {requestHeaders: details.requestHeaders};
        },
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]);



}

chrome.tabs.onCreated.addListener(prevent_fingerprinting);
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == 'complete') prevent_fingerprinting(tab);
});
*/
