var bus = require("bus-service").bus;
var facebookCallback = null;
var linkedinCallback = null;
var twitterCallback = null;
var googleCallback = null;
var scriptInjectorService = exports.scriptInjectorService = {

    insertFacebookIncreasePrivacyScript: function (data) {
        chrome.tabs.executeScript(data.tabId, {
            code: data.code
        }, function () {
            insertCSS(data.tabId, "operando/assets/css/feedback.css");
            injectScript(data.tabId, "operando/modules/osp/writeFacebookSettings.js", ["FeedbackProgress", "jQuery"]);
        });
    },

    insertLinkedinIncreasePrivacyScript:function(data){
        injectScript(data.tabId, "operando/modules/osp/writeLinkedinSettings.js", ["FeedbackProgress", "jQuery"], function(){
            insertCSS(data.tabId, "operando/assets/css/feedback.css");
        });
    },

    insertTwitterIncreasePrivacyScript:function(data){
        injectScript(data.tabId,  "operando/modules/osp/writeTwitterSettings.js", ["FeedbackProgress", "jQuery", "Tooltipster"], function(){
            insertCSS(data.tabId, "operando/assets/css/feedback.css");
            insertCSS(data.tabId, "operando/assets/css/change-identity.css");
            insertCSS(data.tabId, "operando/utils/tooltipster/tooltipster.bundle.min.css");
            insertCSS(data.tabId, "operando/utils/tooltipster/tooltipster-plus-privacy.css");

        });
    },

    insertGoogleIncreasePrivacyScript:function(data){
        injectScript(data.tabId, "operando/modules/osp/writeGoogleSettings.js", ["FeedbackProgress", "jQuery"], function(){
            insertCSS(data.tabId, "operando/assets/css/feedback.css");
        });
    },

    facebookMessage : function (callback){
        facebookCallback = callback;
    },

    linkedinMessage:function(callback){
        linkedinCallback = callback;
    },
    twitterMessage: function(callback){
        twitterCallback = callback;
    },
    googleMessage:function(callback){
        googleCallback = callback;
    },
    waitingFacebookCommand:function(instructions){
        facebookCallback (instructions);
    },
    waitingLinkedinCommand:function(instructions){
        linkedinCallback (instructions);
    },
    waitingTwitterCommand:function(instructions){
        twitterCallback(instructions);
    },
    waitingGoogleCommand : function(instructions){
        console.log("easa");
        googleCallback(instructions);
    }

};
bus.registerService(scriptInjectorService);
