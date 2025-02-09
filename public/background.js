// 存储默认快捷键
const DEFAULT_SHORTCUT = {
  ctrl: true,
  alt: false,
  shift: false,
  key: 'K'
}

// 监听快捷键更新消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SHORTCUT') {
    // 保存新的快捷键设置
    chrome.storage.local.set({ shortcut: request.shortcut }, () => {
      sendResponse({ success: true })
    })
    return true // 保持消息通道开启以支持异步响应
  }
})

// 监听键盘事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化快捷键设置
  chrome.storage.local.get('shortcut', (result) => {
    if (!result.shortcut) {
      chrome.storage.local.set({ shortcut: DEFAULT_SHORTCUT })
    }
  })
})

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'quick_search' || command === '_execute_action') {
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 800,
      height: 600,
      focused: true,
    });
  }
});

// 修改右键菜单点击处理器，保持一致的窗口大小
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'quick-search') {
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 800,
      height: 600,
      focused: true
    });
  }
});

// 初始化右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'quick-search',
    title: '快速搜索书签',
    contexts: ['all']
  });
});

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark Manager 已安装/更新')
}) 