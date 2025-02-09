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

// 监听键盘事件
document.addEventListener('keydown', async (e) => {
  // 获取保存的快捷键设置
  const { shortcut } = await chrome.storage.local.get('shortcut')

  // 检查是否匹配快捷键
  if (
    e.ctrlKey === shortcut.ctrl &&
    e.altKey === shortcut.alt &&
    e.shiftKey === shortcut.shift &&
    e.key.toUpperCase() === shortcut.key
  ) {
    e.preventDefault()

    // 打开搜索弹窗
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 600,
      height: 400,
      focused: true
    })
  }
})

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark Manager 已安装/更新')
})

// 可以添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'quick-search',
    title: '快速搜索书签',
    contexts: ['all']
  })
})

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'quick-search') {
    chrome.windows.create({
      url: 'index.html#/search',
      type: 'popup',
      width: 600,
      height: 400,
      focused: true
    })
  }
}) 