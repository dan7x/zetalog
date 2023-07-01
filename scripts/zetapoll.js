/*
Content script for https://arithmetic.zetamac.com/
Useful test: https://arithmetic.zetamac.com/game?key=167ff21c (2 second game)

This JS will be injected into the page's source to scrape the webpage.
*/

function submitPayload(payload){
    /*
    Params: dict
    A payload is assumed to have the following keys:
        - add, add_left_max, add_left_min, add_right_max, add_right_min, div, duration, mul, mul_left_max, mul_left_min, mul_right_max, mul_right_min
        - score
        - key
        - timestamp

    Result: 
        - push payload to gsheet
        - update records in chrome.storage
    */
    console.log("Send payload", payload);
    // send message to backend to be pushed to gsheet, chrome.storage, whatever.
    chrome.runtime.sendMessage({type: "game_over", payload: payload});
}


function onGameOver(score) {
    // on game over, save some vars locally and write to gsheet
    const ZETAMAC_URL = "https://arithmetic.zetamac.com/";

    // console.log("Game over. Score: ", score);
    // chrome.storage.local.get(console.log);
    // console.log(document.URL);

    let params = new URLSearchParams(window.location.search);
    const gameKey = params.get("key");
    
    // console.log(htmlRes.innerHTML);
    const scriptTags = document.getElementsByTagName("script");

    var payload = null;
    for(st of scriptTags){
        if(st.innerHTML.includes("Arithmetic.init({")){
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(st.innerHTML);
            //matches[1] contains the value between the curlies
            payload = JSON.parse(matches[1]);
        }
    }
    // console.log(payload);
    if(payload != null){
        console.log("Key, score:", gameKey, score);
        payload["key"] = gameKey;
        payload["score"] = score;
        payload["timestamp"] = Date.now();
        submitPayload(payload);
    }
    else{
        console.log("Error getting game data...");
    }

}

// Watch for changes in the scoring elements
let observer = new MutationObserver(mutations => {
    const SECONDS_STR = "Seconds left: ";
    const SCORE_STR = "Score: ";
    for(let mutation of mutations) {
        for(let addedNode of mutation.addedNodes) {

            // get inner HTML of modified node
            var tmp = document.createElement("div");
            tmp.appendChild(addedNode.cloneNode());
            let secondsRemaining = tmp.innerHTML;

            // check if modified node is the "seconds left: " node
            if(secondsRemaining.includes(SECONDS_STR)){
                console.log(secondsRemaining, typeof(secondsRemaining));
                // console.log(document.URL);
                const secondsLeft = parseInt(secondsRemaining.replace(SECONDS_STR, ""));

                // if 0 seconds left, do gameover
                if(secondsLeft === 0){
                    const correct = document.getElementsByClassName("correct");
                    if(correct.length > 0){
                        const score = correct[0].innerHTML.replace(SCORE_STR, "");
                        onGameOver(parseInt(score));
                    }
                }
            }

        }
    }
});

observer.observe(document, { childList: true, subtree: true });
