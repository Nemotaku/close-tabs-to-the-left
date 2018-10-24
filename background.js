function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

const menuItemParams = {
  id: "close_right",
  title: browser.i18n.getMessage("contextItemTitle"),
  contexts: ["tab"]
};
browser.contextMenus.create(menuItemParams, onCreated);

function closeTabs(sender, tabs) {
    var isOkToClose = false;
    for (var tab of tabs) {
        if (isOkToClose && !tab.pinned)
            browser.tabs.remove(tab.id);
        if(tab.id == sender.id)
            isOkToClose = true;
    }
}

browser.contextMenus.onClicked.addListener(function(info, sender) {
    var querying = browser.tabs.query({currentWindow: true});

    querying.then(closeTabs.bind(null, sender));
});


// supports Tree Style Tab's fake context menu
// https://addons.mozilla.org/firefox/addon/tree-style-tab/
function registerToTST() {
    browser.runtime.sendMessage("treestyletab@piro.sakura.ne.jp", {
        type: "fake-contextMenu-create",
        params: menuItemParams
    }).then(onCreated, onCreated);
}
browser.runtime.onMessageExternal.addListener((message, sender) => {
    switch (sender.id) {
        case "treestyletab@piro.sakura.ne.jp":
            switch (message.type) {
                case "ready":
                    registerToTST();
                    return;
                case "fake-contextMenu-click":
                    browser.tabs.query({currentWindow: true})
                        .then(tabs => closeTabs(message.tab, tabs));
                    return;
            }
    }
});
registerToTST();
