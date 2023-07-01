chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "game_over"){
        // submitLocals(request.payload);  // implement records later
        chrome.storage.local.get(["sheetID", "sheetTab"], function(options){
            gsheetSubmitPayload(request.payload, options.sheetID, `'${options.sheetTab}'`);
        });
    }
    // add more ifs here if i can come up with whatever else may have use for this data.
    sendResponse();
});

function gsheetSubmitPayload(payload, sheetId, sheet){
    /*
    Params: 
        - payload : dict
        - sheetId : gsheet URL ID
        - sheet : individual sheetname in sheetfile
    A payload is assumed to have the following keys:
        - add, add_left_max, add_left_min, add_right_max, add_right_min, div, duration, mul, mul_left_max, mul_left_min, mul_right_max, mul_right_min
        - score
        - key
        - timestamp

    Result: 
        - push payload to gsheet
    */
    console.log("push payload to sheet and store here", payload);

    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
        // console.log(token);

        let sheetRead = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };

        // const score_row = Object.values(payload);
        const score_row = { 'values': [Object.values(payload)] };
        // const score_row = { 'values': ['123', '456x'] };
        console.log(score_row);

        let sheetWrite = {
            method: 'PUT',
            async: true,
            body: JSON.stringify(score_row),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };
        
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheet}`, sheetRead)
        .then((response) => response.json())
        .then(function(data) {
            console.log(data);
            let insertIndex;
            if(!("values" in data)){ // sheet is empty
                // insert header row
                console.log("Inserting header row to GSheet.");
                const headerKeys = {'values': [Object.keys(payload)]};

                let headerWrite = {
                    method: 'PUT',
                    async: true,
                    body: JSON.stringify(headerKeys),
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    'contentType': 'json'
                };

                // write header row to gsheet
                fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheet}?valueInputOption=USER_ENTERED`, headerWrite)
                .then(response => response.json())
                .then(function(response){
                    if("error" in response){
                        console.log("Gsheet header write failed with error -- ensure sheet exists:", response['error']);
                    }else{
                        console.log("Wrote header rows with response:", response);
                    }
                })
                .catch(function(err){
                    console.log("Failed to insert header row: ", err);
                });
                insertIndex = 2;
            }else{
                insertIndex = data['values'].length + 1;
            }

            console.log("Attempting to write to GSheet...", data);
            sheet = `${sheet}!A${insertIndex}:Z${insertIndex}`
            console.log(sheet);

            // write resulting game data to gsheet
            fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheet}?valueInputOption=USER_ENTERED`, sheetWrite)
            .then(response => response.json())
            .then(function(data){
                if("error" in data){
                    console.log("GSheet write failed. Error -- ensure sheet exists: ", data["error"]);
                }else{
                    console.log("Wrote to GSheet:", data);
                }
            })
            .catch(function(err){
                console.log("Failed to write to GSheet due to err -- ensure sheet exists: ", err);
            })
        })
        .catch(function(err){
            console.log("Failed to read GSheet for update -- ensure sheet exists: ", err);
        });

    });

}

// function submitLocals(payload){
//     // modify chrome.local
//     // maybe use this at some point to incorporate a records-by-key
//     // feature at some point stored in chrome.local or something

//     const score = payload['score'];
//     const key = payload['key'];

// }
