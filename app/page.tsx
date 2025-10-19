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
  avatar?: string // base64 编码的头像图片
  schedule: {
    free: { start: string; end: string }[] // 空闲时间
    work: { start: string; end: string }[] // 学习/工作时间
    sleep: { start: string; end: string }[] // 睡觉时间
  }
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
  const [avatar, setAvatar] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingClockId, setEditingClockId] = useState<string | null>(null)
  const [showVisualization, setShowVisualization] = useState(false)
  
  // 日程设置状态
  const [schedule, setSchedule] = useState({
    free: [{ start: '18:00', end: '22:00' }],
    work: [{ start: '09:00', end: '17:00' }],
    sleep: [{ start: '23:00', end: '07:00' }]
  })

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

  // 头像上传处理
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 添加时间段
  const addTimeSlot = (type: 'free' | 'work' | 'sleep') => {
    setSchedule(prev => ({
      ...prev,
      [type]: [...prev[type], { start: '00:00', end: '00:00' }]
    }))
  }

  // 删除时间段
  const removeTimeSlot = (type: 'free' | 'work' | 'sleep', index: number) => {
    setSchedule(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  // 更新时间段
  const updateTimeSlot = (type: 'free' | 'work' | 'sleep', index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [type]: prev[type].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const addClock = () => {
    if (!selectedTimezone || !ownerName.trim()) return

    const timezoneData = COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone)
    if (!timezoneData) return

    const newClock: ClockData = {
      id: Date.now().toString(),
      timezone: selectedTimezone,
      location: timezoneData.label,
      owner: ownerName.trim(),
      avatar: avatar || undefined,
      schedule: { ...schedule }
    }

    setClocks(prev => [...prev, newClock])
    setSelectedTimezone('')
    setOwnerName('')
    setAvatar('')
    setSchedule({
      free: [{ start: '18:00', end: '22:00' }],
      work: [{ start: '09:00', end: '17:00' }],
      sleep: [{ start: '23:00', end: '07:00' }]
    })
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

  // 获取当前状态
  const getCurrentStatus = (clock: ClockData) => {
    try {
      const zonedTime = utcToZonedTime(currentTime, clock.timezone)
      const currentHour = zonedTime.getHours()
      const currentMinute = zonedTime.getMinutes()
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // 检查是否在睡觉时间
      for (const sleepSlot of clock.schedule.sleep) {
        if (isTimeInRange(currentTimeStr, sleepSlot.start, sleepSlot.end)) {
          return { status: 'sleep', color: '#6c757d', emoji: '😴' }
        }
      }
      
      // 检查是否在工作时间
      for (const workSlot of clock.schedule.work) {
        if (isTimeInRange(currentTimeStr, workSlot.start, workSlot.end)) {
          return { status: 'work', color: '#ffc107', emoji: '💼' }
        }
      }
      
      // 检查是否在空闲时间
      for (const freeSlot of clock.schedule.free) {
        if (isTimeInRange(currentTimeStr, freeSlot.start, freeSlot.end)) {
          return { status: 'free', color: '#28a745', emoji: '😊' }
        }
      }
      
      return { status: 'unknown', color: '#6c757d', emoji: '❓' }
    } catch (error) {
      return { status: 'unknown', color: '#6c757d', emoji: '❓' }
    }
  }

  // 检查时间是否在范围内
  const isTimeInRange = (current: string, start: string, end: string) => {
    const currentMinutes = timeToMinutes(current)
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      // 跨天的情况
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    }
  }

  // 时间转换为分钟
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // 分析最佳聚会时间
  const analyzeBestTimes = () => {
    const analysis = {
      allFree: [] as string[],
      allAwake: [] as string[],
      mostFree: [] as string[]
    }
    
    // 生成24小时的时间点
    const timePoints = []
    for (let hour = 0; hour < 24; hour++) {
      timePoints.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    
    timePoints.forEach(time => {
      let freeCount = 0
      let awakeCount = 0
      
      clocks.forEach(clock => {
        const status = getCurrentStatus(clock)
        if (status.status === 'free') freeCount++
        if (status.status !== 'sleep') awakeCount++
      })
      
      if (freeCount === clocks.length && clocks.length > 0) {
        analysis.allFree.push(time)
      }
      if (awakeCount === clocks.length && clocks.length > 0) {
        analysis.allAwake.push(time)
      }
      if (freeCount >= Math.ceil(clocks.length * 0.7)) {
        analysis.mostFree.push(time)
      }
    })
    
    return analysis
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
            {clocks.map((clock) => {
              const status = getCurrentStatus(clock)
              return (
                <div key={clock.id} className="clock-card">
                  <div className="clock-header">
                    <div className="clock-user-info">
                      <div className="avatar-container">
                        {clock.avatar ? (
                          <img src={clock.avatar} alt={clock.owner} className="user-avatar" />
                        ) : (
                          <div className="default-avatar">👤</div>
                        )}
                      </div>
                      <div>
                        <h3 className="clock-location">{clock.location}</h3>
                        <div className="clock-owner">{clock.owner}</div>
                        <div className="current-status" style={{ color: status.color }}>
                          {status.emoji} {status.status === 'free' ? '空闲' : status.status === 'work' ? '工作' : status.status === 'sleep' ? '睡觉' : '未知'}
                        </div>
                      </div>
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
              )
            })}
          </div>
          
          <div className="action-buttons">
            <button className="share-btn" onClick={generateShareUrl}>
              🔗 生成分享链接
            </button>
            <button className="visualize-btn" onClick={() => setShowVisualization(!showVisualization)}>
              📊 {showVisualization ? '隐藏' : '显示'}时间分析
            </button>
          </div>

          {showVisualization && clocks.length > 0 && (
            <div className="visualization-section">
              <h3>📊 最佳聚会时间分析</h3>
              {(() => {
                const analysis = analyzeBestTimes()
                return (
                  <div className="analysis-results">
                    <div className="analysis-item">
                      <h4>🟢 所有人都有空的时间</h4>
                      <div className="time-slots">
                        {analysis.allFree.length > 0 ? (
                          analysis.allFree.map(time => (
                            <span key={time} className="time-slot free">{time}</span>
                          ))
                        ) : (
                          <span className="no-time">暂无完全空闲时间</span>
                        )}
                      </div>
                    </div>
                    <div className="analysis-item">
                      <h4>🟡 所有人都醒着的时间</h4>
                      <div className="time-slots">
                        {analysis.allAwake.length > 0 ? (
                          analysis.allAwake.map(time => (
                            <span key={time} className="time-slot awake">{time}</span>
                          ))
                        ) : (
                          <span className="no-time">暂无共同清醒时间</span>
                        )}
                      </div>
                    </div>
                    <div className="analysis-item">
                      <h4>🟠 大多数人空闲的时间 (70%+)</h4>
                      <div className="time-slots">
                        {analysis.mostFree.length > 0 ? (
                          analysis.mostFree.map(time => (
                            <span key={time} className="time-slot most-free">{time}</span>
                          ))
                        ) : (
                          <span className="no-time">暂无多数人空闲时间</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </>
      )}

      <div className="add-clock-section">
        <h2 className="add-clock-title">添加新时钟</h2>
        
        <div className="user-info-section">
          <div className="avatar-upload">
            <label className="avatar-label">
              {avatar ? (
                <img src={avatar} alt="头像预览" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>📷</span>
                  <span>上传头像</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="avatar-input"
              />
            </label>
          </div>
          
          <div className="user-details">
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
          </div>
        </div>

        <div className="schedule-section">
          <h3>设置你的日常时间</h3>
          <div className="schedule-tabs">
            <div className="schedule-tab">
              <h4>😊 空闲时间</h4>
              {schedule.free.map((slot, index) => (
                <div key={index} className="time-slot-input">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot('free', index, 'start', e.target.value)}
                  />
                  <span>至</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot('free', index, 'end', e.target.value)}
                  />
                  <button onClick={() => removeTimeSlot('free', index)}>删除</button>
                </div>
              ))}
              <button onClick={() => addTimeSlot('free')} className="add-slot-btn">+ 添加空闲时间</button>
            </div>

            <div className="schedule-tab">
              <h4>💼 工作/学习时间</h4>
              {schedule.work.map((slot, index) => (
                <div key={index} className="time-slot-input">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot('work', index, 'start', e.target.value)}
                  />
                  <span>至</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot('work', index, 'end', e.target.value)}
                  />
                  <button onClick={() => removeTimeSlot('work', index)}>删除</button>
                </div>
              ))}
              <button onClick={() => addTimeSlot('work')} className="add-slot-btn">+ 添加工作时间</button>
            </div>

            <div className="schedule-tab">
              <h4>😴 睡觉时间</h4>
              {schedule.sleep.map((slot, index) => (
                <div key={index} className="time-slot-input">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot('sleep', index, 'start', e.target.value)}
                  />
                  <span>至</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot('sleep', index, 'end', e.target.value)}
                  />
                  <button onClick={() => removeTimeSlot('sleep', index)}>删除</button>
                </div>
              ))}
              <button onClick={() => addTimeSlot('sleep')} className="add-slot-btn">+ 添加睡觉时间</button>
            </div>
          </div>
        </div>

        <button
          className="add-btn"
          onClick={addClock}
          disabled={!selectedTimezone || !ownerName.trim()}
        >
          添加时钟
        </button>
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
