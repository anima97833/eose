import React, { useState, useRef } from 'react';
import { X, Download, Share2, Sparkles, MapPin, Calendar, Heart, ArrowRight } from 'lucide-react';
import { CheckInSpot } from '../../../../core/compass/types';
import {
  generateTravelReport,
  ReportPeriod,
  TravelReportData,
} from '../../../../core/compass/travelReportEngine';
import { loadDossierFromDB, saveDossierToDB } from '../../../../core/rpg/dossierStorage';

interface TravelWeeklyReportModalProps {
  spots: CheckInSpot[];
  onClose: () => void;
  onShowToast: (title: string, sub?: string) => void;
}

export const TravelWeeklyReportModal: React.FC<TravelWeeklyReportModalProps> = ({
  spots,
  onClose,
  onShowToast,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('7d');
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 挖掘当前周期的报告数据
  const report: TravelReportData = generateTravelReport(spots, period);

  /**
   * 使用离屏高分辨率 Canvas 生成并保存海报
   */
  const handleSavePoster = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // 离屏 Canvas (高清晰度 800 x 1400, 2x 缩放确保晶莹剔透)
      const width = 800;
      const height = 1350;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D 上下文初始化失败');
      }

      // 1. 绘制马卡龙天青渐变底色
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#7ee8e2');
      bgGrad.addColorStop(0.25, '#a4ede5');
      bgGrad.addColorStop(0.65, '#c8f5e1');
      bgGrad.addColorStop(1, '#def8ec');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 背景虚化卡片纹理装饰
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(40, 100, 320, 220, 24);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(width - 340, 280, 300, 240, 24);
      ctx.fill();

      // 2. 顶部 Logo 与周期标签
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.fillText('CLOUDFLY · 时空漫步回顾', 60, 90);

      // 周期药丸胶囊
      ctx.fillStyle = 'rgba(15, 89, 72, 0.12)';
      ctx.beginPath();
      ctx.roundRect(width - 220, 60, 160, 42, 21);
      ctx.fill();
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.textAlign = 'center';
      ctx.fillText(report.periodLabel, width - 140, 88);
      ctx.textAlign = 'left';

      // 3. 核心人文大标题 (高度还原截图)
      ctx.font = '900 68px -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText(report.heroTitle, 60, 190);

      // 导语小副标
      ctx.font = '500 28px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#1b6b5a';
      ctx.fillText(report.subtitle, 60, 245);

      // 4. 核心高光大数字 62.96%
      ctx.font = '900 86px -apple-system, "DIN Alternate", "SF Pro Display", sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.fillText(report.mainPercent, 60, 375);

      const numWidth = ctx.measureText(report.mainPercent).width;
      ctx.font = 'bold 36px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText(report.mainPercentLabel, 60 + numWidth + 10, 365);

      // 次级大粗体高亮 (如出发时段)
      ctx.font = '600 32px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#1b6b5a';
      ctx.fillText('集中在', 60, 435);
      ctx.font = '900 44px -apple-system, sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.fillText(report.busiestTimeRange, 170, 438);

      // 叙事诗意短句
      ctx.font = '500 28px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#207563';
      ctx.fillText(report.poeticLines[0] || '订票定行程收拾行李，一气呵成', 60, 505);
      ctx.fillText(report.poeticLines[1] || '即兴出发的快乐，你一定很懂', 60, 550);

      // 5. 7天微缩柱状图卡片 (数据可视化)
      const chartX = 60;
      const chartY = 600;
      const chartW = width - 120;
      const chartH = 190;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.roundRect(chartX, chartY, chartW, chartH, 20);
      ctx.fill();

      // 柱状图标题
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText('📅 出行节奏分布', chartX + 24, chartY + 36);

      const colWidth = 32;
      const totalCols = report.dailyBars.length;
      const colGap = (chartW - 60 - totalCols * colWidth) / (totalCols - 1);

      report.dailyBars.forEach((b, idx) => {
        const bx = chartX + 30 + idx * (colWidth + colGap);
        const maxH = 80;
        const bh = (b.heightPercent / 100) * maxH;
        const by = chartY + 140 - bh;

        // 柱体
        ctx.fillStyle = b.isMax ? '#0f5948' : 'rgba(15, 89, 72, 0.35)';
        ctx.beginPath();
        ctx.roundRect(bx, by, colWidth, bh, 10);
        ctx.fill();

        // 星期标签
        ctx.font = b.isMax ? 'bold 18px -apple-system, sans-serif' : '17px -apple-system, sans-serif';
        ctx.fillStyle = b.isMax ? '#0f5948' : '#3c7a6e';
        ctx.textAlign = 'center';
        ctx.fillText(b.dayOfWeek, bx + colWidth / 2, chartY + 168);
        ctx.textAlign = 'left';
      });

      // 6. 最常去地点与同行画像横条
      const statY = 815;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.roundRect(chartX, statY, chartW, 110, 20);
      ctx.fill();

      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText('📍 最常出没据点', chartX + 24, statY + 42);
      ctx.font = '900 28px -apple-system, sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.fillText(report.topSpotName, chartX + 24, statY + 85);

      // 右侧随行画像
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText('👥 漫步同行', chartX + chartW - 220, statY + 42);
      ctx.font = '800 26px -apple-system, sans-serif';
      ctx.fillStyle = '#0f5948';
      ctx.fillText(report.topCompanion, chartX + chartW - 220, statY + 85);

      // 7. 底部微缩出行车票 (高度还原用户截图下半部分！)
      const ticketX = 60;
      const ticketY = 960;
      const ticketW = width - 240;
      const ticketH = 260;

      // 票据主体
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.beginPath();
      ctx.roundRect(ticketX, ticketY, ticketW, ticketH, 24);
      ctx.fill();

      // 出发站 ➔ 到达站
      ctx.fillStyle = '#f0fbf6';
      ctx.beginPath();
      ctx.roundRect(ticketX + 30, ticketY + 36, 170, 60, 16);
      ctx.fill();
      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.fillStyle = '#125648';
      ctx.textAlign = 'center';
      ctx.fillText(report.ticket.from, ticketX + 115, ticketY + 74);

      // 箭头
      ctx.font = 'bold 26px -apple-system, sans-serif';
      ctx.fillStyle = '#3c7a6e';
      ctx.fillText('➔', ticketX + 235, ticketY + 74);

      // 终点
      ctx.fillStyle = '#f0fbf6';
      ctx.beginPath();
      ctx.roundRect(ticketX + 265, ticketY + 36, 170, 60, 16);
      ctx.fill();
      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.fillStyle = '#125648';
      ctx.fillText(report.ticket.to, ticketX + 350, ticketY + 74);
      ctx.textAlign = 'left';

      // 虚线分割
      ctx.strokeStyle = '#c5edd8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(ticketX + 30, ticketY + 130);
      ctx.lineTo(ticketX + ticketW - 30, ticketY + 130);
      ctx.stroke();
      ctx.setLineDash([]);

      // 票面信息
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillStyle = '#5c9488';
      ctx.fillText('班次 ' + report.ticket.ticketNo, ticketX + 30, ticketY + 175);
      ctx.fillText('日期 ' + report.ticket.date, ticketX + 30, ticketY + 215);

      // 仿真微缩二维码方阵
      ctx.fillStyle = 'rgba(15, 89, 72, 0.25)';
      ctx.beginPath();
      ctx.roundRect(ticketX + ticketW - 100, ticketY + 150, 70, 70, 8);
      ctx.fill();

      // 8. 绘制可爱黄色卡通小行李箱抱爱心 (高度还原截图下方的插画！)
      const boxX = width - 260;
      const boxY = 960;

      // 顶部黑色拉杆
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(boxX + 60, boxY + 20);
      ctx.lineTo(boxX + 60, boxY - 18);
      ctx.lineTo(boxX + 110, boxY - 18);
      ctx.lineTo(boxX + 110, boxY + 20);
      ctx.stroke();

      // 黑色提手
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.roundRect(boxX + 70, boxY + 5, 30, 10, 5);
      ctx.fill();

      // 行李箱身体 (暖黄色圆角矩形)
      ctx.fillStyle = '#fdb838';
      ctx.beginPath();
      ctx.roundRect(boxX + 10, boxY + 20, 160, 210, 36);
      ctx.fill();

      // 箱面纵向凹凸纹理线条
      ctx.strokeStyle = '#e29a20';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(boxX + 50, boxY + 60);
      ctx.lineTo(boxX + 50, boxY + 200);
      ctx.moveTo(boxX + 130, boxY + 60);
      ctx.lineTo(boxX + 130, boxY + 200);
      ctx.stroke();

      // 大眼睛 (左)
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.ellipse(boxX + 55, boxY + 80, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // 高光
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(boxX + 52, boxY + 75, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 大眼睛 (右)
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.ellipse(boxX + 105, boxY + 80, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // 高光
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(boxX + 102, boxY + 75, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 可爱微笑小嘴
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(boxX + 80, boxY + 98, 10, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // 腮红
      ctx.fillStyle = 'rgba(255, 120, 120, 0.45)';
      ctx.beginPath();
      ctx.arc(boxX + 38, boxY + 98, 8, 0, Math.PI * 2);
      ctx.arc(boxX + 122, boxY + 98, 8, 0, Math.PI * 2);
      ctx.fill();

      // 双手捧着的粉红发光大爱心 ❤️
      const heartX = boxX + 80;
      const heartY = boxY + 160;
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.moveTo(heartX, heartY);
      ctx.bezierCurveTo(heartX - 35, heartY - 35, heartX - 50, heartY + 15, heartX, heartY + 45);
      ctx.bezierCurveTo(heartX + 50, heartY + 15, heartX + 35, heartY - 35, heartX, heartY);
      ctx.fill();

      // 小手萌爪 (抱住爱心)
      ctx.fillStyle = '#fdb838';
      ctx.beginPath();
      ctx.ellipse(heartX - 35, heartY + 8, 14, 10, 0.3, 0, Math.PI * 2);
      ctx.ellipse(heartX + 35, heartY + 8, 14, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // 9. 底部签名
      ctx.font = 'bold 18px -apple-system, sans-serif';
      ctx.fillStyle = '#207563';
      ctx.textAlign = 'center';
      ctx.fillText('— CLOUDFLY 户外手账 · 专属记忆海报 —', width / 2, height - 40);
      ctx.textAlign = 'left';

      // 导出高画质 PNG
      const posterDataUrl = canvas.toDataURL('image/png', 0.95);

      // A. 存入小手机本地相册 (dossierStorage -> albumPhotos)
      const currentDossier = await loadDossierFromDB();
      const existingPhotos = currentDossier.albumPhotos || [];
      const updatedPhotos = [posterDataUrl, ...existingPhotos];
      await saveDossierToDB({ albumPhotos: updatedPhotos });
      window.dispatchEvent(new CustomEvent('cloudfly_dossier_updated'));

      // B. 自动触发本地图片文件下载
      const link = document.createElement('a');
      link.download = `出行周报_${report.period}_${Date.now()}.png`;
      link.href = posterDataUrl;
      link.click();

      onShowToast('海报已生成！', '已保存至手机相册，并已下载到本地');
    } catch (err) {
      console.error('海报生成失败:', err);
      onShowToast('生成失败', '请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeInReport 0.25s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeInReport {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* 报告主体容器 */}
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '92vh',
          borderRadius: '28px',
          background: 'linear-gradient(175deg, #7ee8e2 0%, #a4ede5 25%, #c8f5e1 65%, #def8ec 100%)',
          boxShadow: '0 20px 50px rgba(18, 86, 72, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* 顶部工具栏：周期切换与关闭按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 10px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* 多周期切换微拟物胶囊 */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.45)',
              padding: '3px',
              borderRadius: '20px',
              backdropFilter: 'blur(6px)',
              boxShadow: 'inset 1px 1px 2px rgba(15, 89, 72, 0.15)',
            }}
          >
            {(['7d', '30d', 'all'] as ReportPeriod[]).map((p) => {
              const labelMap: Record<ReportPeriod, string> = {
                '7d': '近7天',
                '30d': '近30天',
                all: '全部足迹',
              };
              const active = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    border: 'none',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    background: active ? '#0f5948' : 'transparent',
                    color: active ? '#ffffff' : '#125648',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labelMap[p]}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.5)',
              color: '#125648',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '1px 2px 5px rgba(0,0,0,0.06)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容滚动展示区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 20px 20px',
            position: 'relative',
          }}
        >
          {/* 大标题与导语 (高度还原用户截图) */}
          <div style={{ marginTop: '8px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 900,
                color: '#125648',
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
                fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
              }}
            >
              {report.heroTitle}
            </h1>
            <div
              style={{
                marginTop: '6px',
                fontSize: '13px',
                color: '#1b6b5a',
                fontWeight: 600,
                letterSpacing: '0.2px',
              }}
            >
              {report.subtitle}
            </div>
          </div>

          {/* 核心高光大数字与行程特征 */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#0f5948',
                  lineHeight: 1,
                  fontFamily: '"DIN Alternate", -apple-system, sans-serif',
                }}
              >
                {report.mainPercent}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#125648' }}>
                {report.mainPercentLabel}
              </span>
            </div>

            <div
              style={{
                marginTop: '6px',
                fontSize: '15px',
                color: '#1b6b5a',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>集中在</span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#0f5948',
                  background: 'rgba(255, 255, 255, 0.4)',
                  padding: '1px 8px',
                  borderRadius: '8px',
                }}
              >
                {report.busiestTimeRange}
              </span>
              <span>出发</span>
            </div>

            <div
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: '#207563',
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              <div>{report.poeticLines[0]}</div>
              <div>{report.poeticLines[1]}</div>
            </div>
          </div>

          {/* 过去 7 天微缩柱状图 (数据可视化) */}
          <div
            style={{
              marginTop: '18px',
              padding: '12px 14px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.42)',
              backdropFilter: 'blur(6px)',
              boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(15, 89, 72, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#125648' }}>
                出行节奏分布
              </span>
              <span style={{ fontSize: '10px', color: '#3c7a6e', fontWeight: 600 }}>
                共打卡 {report.totalCheckIns} 次 · 涉足 {report.uniqueSpotsCount} 处据点
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '75px',
                paddingTop: '6px',
              }}
            >
              {report.dailyBars.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: `${b.heightPercent * 0.55}px`,
                      borderRadius: '8px',
                      background: b.isMax ? '#0f5948' : 'rgba(15, 89, 72, 0.3)',
                      boxShadow: b.isMax ? '0 2px 6px rgba(15, 89, 72, 0.4)' : 'none',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: b.isMax ? 800 : 500,
                      color: b.isMax ? '#0f5948' : '#3c7a6e',
                    }}
                  >
                    {b.dayOfWeek}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 底部出行车票与黄色小行李箱抱爱心角色 (还原用户截图下半部分) */}
          <div
            style={{
              marginTop: '18px',
              position: 'relative',
              paddingBottom: '10px',
            }}
          >
            {/* 微缩车票 */}
            <div
              style={{
                width: '74%',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.85)',
                boxShadow: '0 6px 18px rgba(18, 86, 72, 0.12)',
                padding: '12px 14px',
                boxSizing: 'border-box',
              }}
            >
              {/* 出发地 ➔ 到达地 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: '#e8f8f0',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#125648',
                    maxWidth: '45%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {report.ticket.from}
                </div>

                <ArrowRight size={13} color="#3c7a6e" />

                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: '#e8f8f0',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#125648',
                    maxWidth: '45%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {report.ticket.to}
                </div>
              </div>

              {/* 虚线 */}
              <div
                style={{
                  margin: '8px 0',
                  borderBottom: '1px dashed #b5e6cf',
                }}
              />

              {/* 班次与日期 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  color: '#5c9488',
                  fontWeight: 600,
                }}
              >
                <span>班次 {report.ticket.ticketNo}</span>
                <span>{report.ticket.date}</span>
              </div>
            </div>

            {/* 黄色卡通小行李箱抱心 SVG 插画 (绝对定位在右下角) */}
            <div
              style={{
                position: 'absolute',
                right: '4px',
                bottom: '4px',
                width: '90px',
                height: '110px',
                zIndex: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
              }}
            >
              <svg viewBox="0 0 160 200" width="100%" height="100%">
                {/* 黑色拉杆 */}
                <path d="M 60 30 L 60 12 L 100 12 L 100 30" fill="none" stroke="#2d3748" strokeWidth="6" strokeLinecap="round" />
                <rect x="68" y="24" width="24" height="8" rx="4" fill="#2d3748" />

                {/* 暖黄色行李箱主体 */}
                <rect x="15" y="32" width="130" height="155" rx="30" fill="#fdb838" />

                {/* 凹凸纵向纹路 */}
                <line x1="45" y1="65" x2="45" y2="155" stroke="#e29a20" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="115" y1="65" x2="115" y2="155" stroke="#e29a20" strokeWidth="3.5" strokeLinecap="round" />

                {/* 大眼睛左 */}
                <ellipse cx="50" cy="80" rx="9" ry="13" fill="#1a202c" />
                <circle cx="47" cy="76" r="3.5" fill="#ffffff" />

                {/* 大眼睛右 */}
                <ellipse cx="95" cy="80" rx="9" ry="13" fill="#1a202c" />
                <circle cx="92" cy="76" r="3.5" fill="#ffffff" />

                {/* 微笑小嘴 */}
                <path d="M 66 94 Q 72 102 78 94" fill="none" stroke="#1a202c" strokeWidth="3" strokeLinecap="round" />

                {/* 粉红腮红 */}
                <circle cx="36" cy="94" r="6" fill="#ff7878" opacity="0.5" />
                <circle cx="108" cy="94" r="6" fill="#ff7878" opacity="0.5" />

                {/* 双手抱着的发光大爱心 ❤️ */}
                <path
                  d="M 72 135 C 45 105, 30 145, 72 172 C 114 145, 99 105, 72 135 Z"
                  fill="#ff6b81"
                />

                {/* 小手萌爪 */}
                <ellipse cx="44" cy="140" rx="10" ry="7" transform="rotate(20, 44, 140)" fill="#fdb838" />
                <ellipse cx="100" cy="140" rx="10" ry="7" transform="rotate(-20, 100, 140)" fill="#fdb838" />
              </svg>
            </div>
          </div>
        </div>

        {/* 底部操作工具栏 */}
        <div
          style={{
            padding: '12px 18px 16px',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={handleSavePoster}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #0f5948, #0a4235)',
              boxShadow: '0 6px 16px rgba(15, 89, 72, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {isGenerating ? (
              <span>正在生成高清海报...</span>
            ) : (
              <>
                <Download size={15} />
                <span>生成海报并存入相册</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
