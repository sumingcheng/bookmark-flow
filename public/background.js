// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === "quick_search") {
    // 打开搜索弹窗
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 600,
      height: 400,
      focused: true
    });
  }
});

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark Manager 已安装/更新');
});

// 可以添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'quick-search',
    title: '快速搜索书签',
    contexts: ['all']
  });
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'quick-search') {
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 600,
      height: 400,
      focused: true
    });
  }
}); 