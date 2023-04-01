console.log("background.js");

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log("background.js: onMessage", request.message);

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

    chrome.storage.local.get(["tb:user"]).then(async (result) => {
      if (!result["tb:user"].userID) {
        console.log("user not logged in");
        sendResponse({ message: "Please login to ToobSquid" });
        return;
      }

      console.log("transcribing with url: ", url);

      // need to replace with live url
      const response = await fetch(
        "https://toobsquid-git-development-jupiterandthegiraffe.vercel.app/api/transcribe",
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

      console.log(data);

      if (data.status !== 200) {
        sendResponse({ message: data.message });
        return;
      }

      sendResponse({
        message: {
          title: data.message.video.title,
          description: data.message.video.description,
          hashtags: data.message.video.hashtags,
        },
      });
    });
  }
});
