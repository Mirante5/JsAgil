chrome.runtime.onInstalled.addListener(() => {
  // Quando instalado, define OFF por padrão
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.action.setBadgeText({ tabId: tab.id, text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FF0000" });
    }
  });
});

// Quando o usuário muda de aba
chrome.tabs.onActivated.addListener(({ tabId }) => {
  checkExtensionStatus(tabId);
});

// Quando uma aba é atualizada (recarregada, URL muda, etc)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkExtensionStatus(tabId);
  }
});

// Verifica se o conteúdo está ativo e responde com ON ou OFF
function checkExtensionStatus(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
    if (chrome.runtime.lastError || !response || response.status !== "alive") {
      // Conteúdo não respondeu = OFF
      chrome.action.setBadgeText({ tabId, text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
    } else {
      // Conteúdo respondeu = ON
      chrome.action.setBadgeText({ tabId, text: "ON" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#4688F1" });
    }
  });
}
