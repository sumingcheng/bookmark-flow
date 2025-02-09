import { Item, List, Root, Trigger } from '@radix-ui/react-navigation-menu'
import { FiBookmark, FiSettings } from 'react-icons/fi'

export function PopupMenu() {
  const openPage = (path: string) => {
    // 在新标签页中打开完整页面
    chrome.tabs.create({ 
      url: chrome.runtime.getURL(`index.html#${path}`) 
    })
    // 关闭弹出窗口
    window.close()
  }

  return (
    <Root className="w-64 bg-white font-sans overflow-hidden animate-in fade-in duration-200">
      <List className="flex flex-col">
        <Item>
          <Trigger
            onClick={() => openPage('/home')}
            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 border-b border-gray-100"
          >
            <FiBookmark className="w-4 h-4 mr-3" />
            <span>管理书签</span>
          </Trigger>
        </Item>

        <Item>
          <Trigger
            onClick={() => openPage('/settings')}
            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FiSettings className="w-4 h-4 mr-3" />
            <span>设置</span>
          </Trigger>
        </Item>
      </List>

      <div className="py-2 px-4 bg-blue-50 flex items-center justify-center gap-2 text-xs text-blue-600">
        <FiBookmark className="w-3.5 h-3.5" />
        <span>Bookmark Manager</span>
      </div>
    </Root>
  )
} 