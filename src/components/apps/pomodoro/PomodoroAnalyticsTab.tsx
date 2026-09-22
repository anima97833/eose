import React, { useState, useEffect } from 'react';
import { calculatePomodoroStats, PomodoroOverviewStats } from './pomodoroStorage';
import { Clock, Award, Calendar, BarChart3, TrendingUp } from 'lucide-react';

export const PomodoroAnalyticsTab: React.FC = () => {
  const [stats, setStats] = useState<PomodoroOverviewStats | null>(null);

  const loadStats = async () => {
    const data = await calculatePomodoroStats();
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A8A73' }}>
        正在分析专注数据...
      </div>
    );
  }

  const maxMinutesInTrend = Math.max(...stats.dailyTrend.map((d) => d.minutes), 60);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '12px 16px 14px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* 标题 */}
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2F614C' }}>
          专注统计与复盘 (Analytics)
        </div>
        <div style={{ fontSize: '11px', color: '#6A8A73' }}>
          历史会话自动留存 IndexedDB，记录每一个努力的瞬间
        </div>
      </div>

      {/* 1. 三大指标卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {/* 今日时长 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '10px 8px',
            borderRadius: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Clock size={16} color="#4E937A" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#283618', marginTop: '4px' }}>
            {stats.todayMinutes}
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#6A8A73' }}>分</span>
          </span>
          <span style={{ fontSize: '10px', color: '#6A8A73' }}>今日专注</span>
        </div>

        {/* 今日番茄数 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '10px 8px',
            borderRadius: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Award size={16} color="#E07A5F" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#283618', marginTop: '4px' }}>
            {stats.todayPoms}
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#6A8A73' }}>个</span>
          </span>
          <span style={{ fontSize: '10px', color: '#6A8A73' }}>今日番茄</span>
        </div>

        {/* 本周累计 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '10px 8px',
            borderRadius: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Calendar size={16} color="#5096C6" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#283618', marginTop: '4px' }}>
            {(stats.weekMinutes / 60).toFixed(1)}
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#6A8A73' }}>时</span>
          </span>
          <span style={{ fontSize: '10px', color: '#6A8A73' }}>本周累计</span>
        </div>
      </div>

      {/* 2. 近 7 日每日专注趋势柱状图 */}
      <div
        className="nm-card-sm"
        style={{
          padding: '14px 12px 10px',
          borderRadius: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#283618', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BarChart3 size={14} color="#4E937A" />
            <span>近 7 天每日专注趋势 (分钟)</span>
          </div>
        </div>

        {/* SVG 柱状图 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '110px',
            padding: '0 4px 6px',
            borderBottom: '1px dashed rgba(160, 185, 170, 0.4)',
          }}
        >
          {stats.dailyTrend.map((d, i) => {
            const barHeight = Math.max(6, (d.minutes / maxMinutesInTrend) * 90);
            const isToday = i === stats.dailyTrend.length - 1;

            return (
              <div
                key={d.dayLabel}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                }}
              >
                <span style={{ fontSize: '9px', color: '#6A8A73', fontWeight: 600 }}>
                  {d.minutes > 0 ? `${d.minutes}` : ''}
                </span>

                <div
                  style={{
                    width: '16px',
                    height: `${barHeight}px`,
                    borderRadius: '6px 6px 2px 2px',
                    backgroundColor: isToday ? '#3A5A40' : '#88B79B',
                    boxShadow: isToday ? '0 2px 6px rgba(58, 90, 64, 0.4)' : 'none',
                    transition: 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  title={`${d.dayLabel}: ${d.minutes} 分钟 (${d.pomodoros} 🍅)`}
                />

                <span style={{ fontSize: '10px', color: isToday ? '#283618' : '#7D9585', fontWeight: isToday ? 700 : 500 }}>
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 任务标签时间占比 */}
      <div
        className="nm-card-sm"
        style={{
          padding: '14px 14px',
          borderRadius: '18px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#283618', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} color="#D4A373" />
          <span>分类时间占比分布</span>
        </div>

        {stats.categoryBreakdown.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#3E5045' }}>
                  <span style={{ fontWeight: 600 }}>{cat.label}</span>
                  <span style={{ color: '#6A8A73' }}>
                    {cat.minutes} 分钟 ({cat.percentage}%)
                  </span>
                </div>

                {/* 进度条 */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(215, 230, 220, 0.6)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      backgroundColor: cat.color,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#8A9A90', textAlign: 'center', padding: '10px 0' }}>
            暂无会话分类数据，开启一个番茄钟吧~
          </div>
        )}
      </div>
    </div>
  );
};
