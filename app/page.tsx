'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { zhCN } from 'date-fns/locale'

interface ClockData {
  id: string
  timezone: string
  location: string
  owner: string
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Shanghai', label: '中国 (北京)' },
  { value: 'America/New_York', label: '美国东部 (纽约)' },
  { value: 'America/Los_Angeles', label: '美国西部 (洛杉矶)' },
  { value: 'Europe/London', label: '英国 (伦敦)' },
  { value: 'Europe/Paris', label: '法国 (巴黎)' },
  { value: 'Europe/Berlin', label: '德国 (柏林)' },
  { value: 'Asia/Tokyo', label: '日本 (东京)' },
  { value: 'Asia/Seoul', label: '韩国 (首尔)' },
  { value: 'Australia/Sydney', label: '澳大利亚 (悉尼)' },
  { value: 'America/Toronto', label: '加拿大 (多伦多)' },
  { value: 'America/Vancouver', label: '加拿大 (温哥华)' },
  { value: 'Europe/Amsterdam', label: '荷兰 (阿姆斯特丹)' },
  { value: 'Europe/Rome', label: '意大利 (罗马)' },
  { value: 'Europe/Madrid', label: '西班牙 (马德里)' },
  { value: 'Asia/Singapore', label: '新加坡' },
  { value: 'Asia/Hong_Kong', label: '香港' },
  { value: 'Asia/Taipei', label: '台湾 (台北)' },
  { value: 'America/Chicago', label: '美国中部 (芝加哥)' },
  { value: 'America/Denver', label: '美国山地 (丹佛)' },
  { value: 'Pacific/Auckland', label: '新西兰 (奥克兰)' }
]

export default function Home() {
  const [clocks, setClocks] = useState<ClockData[]>([])
  const [selectedTimezone, setSelectedTimezone] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  // 从 URL 参数加载时钟数据
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const clocksParam = urlParams.get('clocks')
    
    if (clocksParam) {
      try {
        const decodedClocks = JSON.parse(decodeURIComponent(clocksParam))
        setClocks(decodedClocks)
      } catch (error) {
        console.error('Failed to load clocks from URL:', error)
      }
    }
  }, [])

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 生成分享链接
  const generateShareUrl = () => {
    const encodedClocks = encodeURIComponent(JSON.stringify(clocks))
    const baseUrl = window.location.origin + window.location.pathname
    const shareUrl = `${baseUrl}?clocks=${encodedClocks}`
    setShareUrl(shareUrl)
    setShowShareModal(true)
  }

  // 复制分享链接
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('分享链接已复制到剪贴板！')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const addClock = () => {
    if (!selectedTimezone || !ownerName.trim()) return

    const timezoneData = COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone)
    if (!timezoneData) return

    const newClock: ClockData = {
      id: Date.now().toString(),
      timezone: selectedTimezone,
      location: timezoneData.label,
      owner: ownerName.trim()
    }

    setClocks(prev => [...prev, newClock])
    setSelectedTimezone('')
    setOwnerName('')
  }

  const removeClock = (id: string) => {
    setClocks(prev => prev.filter(clock => clock.id !== id))
  }

  const formatTime = (timezone: string) => {
    try {
      const zonedTime = utcToZonedTime(currentTime, timezone)
      return format(zonedTime, 'HH:mm:ss', { locale: zhCN })
    } catch (error) {
      return '--:--:--'
    }
  }

  const formatDate = (timezone: string) => {
    try {
      const zonedTime = utcToZonedTime(currentTime, timezone)
      return format(zonedTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })
    } catch (error) {
      return '--'
    }
  }

  const getTimezoneOffset = (timezone: string) => {
    try {
      const zonedTime = utcToZonedTime(currentTime, timezone)
      const offset = zonedTime.getTimezoneOffset()
      const hours = Math.floor(Math.abs(offset) / 60)
      const minutes = Math.abs(offset) % 60
      const sign = offset <= 0 ? '+' : '-'
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (error) {
      return 'UTC+00:00'
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">🌍 Bamboo Clock</h1>
        <p className="subtitle">与海外留学的朋友们共享世界时钟</p>
      </div>

      {clocks.length === 0 ? (
        <div className="empty-state">
          <p>还没有添加任何时钟，点击下方添加你的第一个时钟吧！</p>
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
            添加完成后可以生成分享链接，让朋友们也添加他们的时钟
          </p>
        </div>
      ) : (
        <>
          <div className="clock-grid">
            {clocks.map((clock) => (
              <div key={clock.id} className="clock-card">
                <div className="clock-header">
                  <div>
                    <h3 className="clock-location">{clock.location}</h3>
                    <div className="clock-owner">👤 {clock.owner}</div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => removeClock(clock.id)}
                    title="删除时钟"
                  >
                    ×
                  </button>
                </div>
                <div className="time-display">{formatTime(clock.timezone)}</div>
                <div className="date-display">{formatDate(clock.timezone)}</div>
                <div className="timezone-info">{getTimezoneOffset(clock.timezone)}</div>
              </div>
            ))}
          </div>
          
          <div className="share-section">
            <button className="share-btn" onClick={generateShareUrl}>
              🔗 生成分享链接
            </button>
          </div>
        </>
      )}

      <div className="add-clock-section">
        <h2 className="add-clock-title">添加新时钟</h2>
        <div className="timezone-selector">
          <input
            type="text"
            className="timezone-input"
            placeholder="你的名字..."
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <select
            className="timezone-input"
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
          >
            <option value="">选择时区...</option>
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <button
            className="add-btn"
            onClick={addClock}
            disabled={!selectedTimezone || !ownerName.trim()}
          >
            添加时钟
          </button>
        </div>
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>分享链接</h3>
            <p>复制下面的链接分享给你的朋友们，他们可以添加自己的时钟：</p>
            <div className="share-url-container">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <button className="copy-btn" onClick={copyShareUrl}>
                复制
              </button>
            </div>
            <button 
              className="close-modal-btn"
              onClick={() => setShowShareModal(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
