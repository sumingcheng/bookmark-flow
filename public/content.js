let searchPopup = null;

// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSearchPopup") {
    if (!searchPopup) {
      createSearchPopup();
    } else {
      removeSearchPopup();
    }
  }
});

function createSearchPopup() {
  searchPopup = document.createElement('div');
  searchPopup.className = 'bookmark-search-popup-overlay';
  
  const popupContent = document.createElement('div');
  popupContent.className = 'bookmark-search-popup-content';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'bookmark-search-input';
  searchInput.placeholder = '搜索书签...';
  
  popupContent.appendChild(searchInput);
  searchPopup.appendChild(popupContent);
  document.body.appendChild(searchPopup);
  
  // 聚焦输入框
  searchInput.focus();
  
  // 点击外部关闭弹窗
  searchPopup.addEventListener('click', (e) => {
    if (e.target === searchPopup) {
      removeSearchPopup();
    }
  });
  
  // ESC 键关闭弹窗
  document.addEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    removeSearchPopup();
  }
}

function removeSearchPopup() {
  if (searchPopup) {
    document.removeEventListener('keydown', handleEscKey);
    searchPopup.remove();
    searchPopup = null;
  }
} 