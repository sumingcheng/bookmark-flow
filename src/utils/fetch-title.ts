export async function fetchPageTitle(url: string): Promise<string> {
  try {
    // 使用 chrome extension API 发送请求
    const response = await fetch(url)
    const html = await response.text()
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/)
    return match ? match[1].trim() : url
  } catch (error) {
    console.error('Failed to fetch page title:', error)
    return url
  }
} 