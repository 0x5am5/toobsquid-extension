console.log("background.js");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("background.js: onMessage", request.message);

  new Promise(async (resolve, reject) => {
    if (
      request.message === "user_logged_in" ||
      request.message === "user_logged_out"
    ) {
      // Listening for user login and logout in Popup // AuthContext
      chrome.storage.local.set({ "tb:user": request.payload }).then(() => {
        console.log("Value is set", request.payload);
      });
    } else if (request.message === "transcribe") {
      const url = sender.tab ? sender.tab.url : "";

      try {
        const result = await chrome.storage.local.get(["tb:user"]);

        if (!result["tb:user"].userID) {
          sendResponse({ message: "Please login to ToobSquid" });
          reject();
          return;
        }

        // need to replace with live url
        const response = await fetch(
          "https://ai.toobsquid.com/api/transcribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              youtubeUrl: url,
              userID: result["tb:user"].userID,
              ...(result["tb:user"].tester && {
                openAIKey: result["tb:user"].openAIKey,
              }),
            }),
          }
        );

        const data = await response.json();

        if (data.status !== 200) {
          sendResponse({ message: data.message });
          reject();
          return;
        }

        sendResponse({
          message: {
            title: data.message.video.title,
            description: data.message.video.description,
            hashtags: data.message.video.hashtags,
            timeStamps: data.message.video.timeStamps,
          },
        });
      } catch (error) {
        sendResponse({ message: error.message });
        reject();
        return;
      }
    }

    resolve();
  });
  return true;
});

chrome.runtime.onInstalled.addListener(function (object) {
  let internalUrl = chrome.runtime.getURL("onboarding.html");

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: internalUrl });
  }
});
