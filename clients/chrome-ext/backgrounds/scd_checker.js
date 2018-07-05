var extensionsWithSCD = [];

function getSCD(path, callback) {
    function reqListener() {

        if (this.status == 404) {
            callback({"found": false});
        }
        else {
            callback({"found": true});
        }

    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", path);
    oReq.send();
}


function checkSCDExistence(extension) {
    if (extension.id) {
        getSCD("chrome-extension://" + extension.id + "/SCD.json", function (result) {
            if (result.found) {
                extensionsWithSCD.push(extension.id)
            }
        })
    }
}

chrome.management.getAll(function (extensions) {
    extensions.forEach(checkSCDExistence);

});


function createNotification(extensionId){

    chrome.management.get(extensionId,function(extensionInfo){

        chrome.notifications.create("complianceViolated",{
            type:"image",
            /*iconUrl:"/operando/assets/images/scd_violation.png",*/
            iconUrl:extensionInfo.icons[2].url,
            imageUrl:"/operando/assets/images/compliance_violated.png",
            title:"Self Compliance violated",
            message:"Self compliance of "+extensionInfo.name+" was violated!",
            buttons:[{title:"Disable "+extensionInfo.name},{title:"Uninstall "+ extensionInfo.name}]

        },function(notificationId){

            var handleClickButton = function (_notificationId, buttonIndex){

                if(notificationId === _notificationId){
                    if(buttonIndex === 0){

                        chrome.management.setEnabled(extensionId,false,function(){
                            chrome.notifications.clear(notificationId);
                        });
                    }
                    else if(buttonIndex === 1){

                        chrome.notifications.clear(notificationId);
                        chrome.management.uninstall(extensionId,{showConfirmDialog:false}, function(){

                            chrome.notifications.create("extensionRemoved",{
                                type:"basic",
                                iconUrl:"/operando/assets/images/compliance_violated.png",
                                title:"Extension was uninstalled",
                                message:extensionInfo.name+" was successfully uninstalled",
                                buttons:[{title:"OK, thank you"}]
                            });

                        });
                    }
                }
                chrome.notifications.onButtonClicked.removeListener(handleClickButton);
            }

            chrome.notifications.onButtonClicked.addListener(handleClickButton);

        });



    });

}





chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (extensionsWithSCD.indexOf(sender.id) >= 0){
            createNotification(sender.id);
        }

});


