import { Root, List, Item, Trigger } from '@radix-ui/react-navigation-menu'
import { FiBookmark, FiSettings } from 'react-icons/fi'
import styles from './popup.module.scss'

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
    <Root className={styles.root}>
      <List className={styles.list}>
        <Item>
          <Trigger
            onClick={() => openPage('/manager')}
            className={styles.trigger}
          >
            <FiBookmark className={styles.icon} />
            <span>管理书签</span>
          </Trigger>
        </Item>

        <Item>
          <Trigger
            onClick={() => openPage('/settings')}
            className={styles.trigger}
          >
            <FiSettings className={styles.icon} />
            <span>设置</span>
          </Trigger>
        </Item>
      </List>

      <div className={styles.footer}>
        <div className={styles.brand}>
          Bookmark Manager
        </div>
      </div>
    </Root>
  )
} 