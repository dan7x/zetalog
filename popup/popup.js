function onSubmit(click){

    let sheetIDObj = document.getElementById('gsheetID');
    let sheetTabObj = document.getElementById('gsheetTab');
    const sheetID = sheetIDObj.value;
    const sheetTab = sheetTabObj.value;
    chrome.storage.local.set({sheetID: sheetID, sheetTab: sheetTab}, function(){

        // check for existence & fetch properties here
        // for now, assume gsheet exists.

        console.log(`Set GSheet target to ${sheetID}; tab is ${sheetTab}`);
        sheetIDObj.value = '';
        sheetTabObj.value = '';

    });
}

function onGotoSheet(click){
    chrome.storage.local.get("sheetID", function(sheetID){
        const id = sheetID['sheetID'];
        window.open(`https://docs.google.com/spreadsheets/d/${id}`, '_blank');
    })
}

document.addEventListener('DOMContentLoaded', function () {
    const SUBMIT_ID = "gsheetform";
    const SHEET_GOTO_ID = "gotosheet";
    var formSubmitSheet = document.getElementById(SUBMIT_ID);
    var gotoSheet = document.getElementById(SHEET_GOTO_ID);
    console.log("SS:", formSubmitSheet);
    chrome.storage.local.get("sheetID", function(sheetID){
        const DISPLAY_ID = "targsheetDisplay";
        var dispID = document.getElementById(DISPLAY_ID);
        console.log(dispID);
        dispID.value = sheetID['sheetID'];
    });


    formSubmitSheet.addEventListener("submit", onSubmit);
    gotoSheet.addEventListener("click", onGotoSheet);
    console.log(formSubmitSheet);
    // btnSubmitSheet.addEventListener("click", onSubmit);

});
