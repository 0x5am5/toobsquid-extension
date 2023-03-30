const buttons = document.querySelector(".ytcp-entity-page-header .buttons");

if (buttons) {
  const button = document.createElement("button");
  button.textContent = "ToobSquid";
  button.onclick = () => {
    chrome.runtime.sendMessage();
  };
  buttons.prepend(button);
}
