import React, { useState } from 'react';
import { Course } from '../../../core/kanban/courseKanbanTypes';
import {
  parseBilibiliCourse,
  parsePanDirectoryText,
  createCustomCourse,
  formatDuration,
} from '../../../core/kanban/courseParserEngine';
import { saveCourse } from '../../../core/kanban/courseKanbanStorage';
import { NM } from '../storyword/storyWordNeumorphism';
import { X, Sparkles, Tv, Folder, Plus, Check } from 'lucide-react';

interface CourseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseAdded: (course: Course) => void;
}

export const CourseImportModal: React.FC<CourseImportModalProps> = ({
  isOpen,
  onClose,
  onCourseAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'bilibili' | 'pan' | 'custom'>('bilibili');

  // B站导入表单
  const [biliInput, setBiliInput] = useState('');
  const [isParsingBili, setIsParsingBili] = useState(false);
  const [biliParsedCourse, setBiliParsedCourse] = useState<Course | null>(null);
  const [biliParsedTitle, setBiliParsedTitle] = useState('');
  const [biliParsedAuthor, setBiliParsedAuthor] = useState('');

  // 网盘导入表单
  const [panTitle, setPanTitle] = useState('');
  const [panAuthor, setPanAuthor] = useState('');
  const [panText, setPanText] = useState('');

  // 自定义表单
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customChapters, setCustomChapters] = useState(12);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  if (!isOpen) return null;

  // 执行 B 站解析
  const handleParseBilibili = async () => {
    if (!biliInput.trim()) {
      showToast('请输入链接');
      return;
    }
    setIsParsingBili(true);
    try {
      const course = await parseBilibiliCourse(biliInput.trim());
      setBiliParsedCourse(course);
      setBiliParsedTitle(course.title);
      setBiliParsedAuthor(course.author);
      showToast('解析成功');
    } catch (err: any) {
      console.warn(err);
      showToast(err.message || '解析失败');
    } finally {
      setIsParsingBili(false);
    }
  };

  const handleConfirmBili = () => {
    if (!biliParsedCourse) return;
    const finalCourse: Course = {
      ...biliParsedCourse,
      title: biliParsedTitle.trim() || biliParsedCourse.title,
      author: biliParsedAuthor.trim() || biliParsedCourse.author,
    };
    saveCourse(finalCourse);
    onCourseAdded(finalCourse);
    showToast('已入看板');
    onClose();
  };

  // 执行网盘目录解析
  const handleConfirmPan = () => {
    if (!panTitle.trim()) {
      showToast('请填课程名');
      return;
    }
    if (!panText.trim()) {
      showToast('请粘贴目录');
      return;
    }
    const course = parsePanDirectoryText(panTitle, panText, panAuthor);
    saveCourse(course);
    onCourseAdded(course);
    showToast('已入看板');
    onClose();
  };

  // 执行自定义创建
  const handleConfirmCustom = () => {
    if (!customTitle.trim()) {
      showToast('请填课程名');
      return;
    }
    const course = createCustomCourse(customTitle, customAuthor, customChapters);
    saveCourse(course);
    onCourseAdded(course);
    showToast('已入看板');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '85vh',
          backgroundColor: NM.cardBg,
          borderRadius: '20px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color={NM.amber} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: NM.textMain }}>
              导入新课程
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 选项卡导航 */}
        <div
          style={{
            display: 'flex',
            padding: '10px 16px',
            gap: '8px',
            backgroundColor: NM.bgInset,
            borderBottom: NM.borderSoft,
          }}
        >
          {[
            { id: 'bilibili', label: 'B站解析', icon: Tv },
            { id: 'pan', label: '网盘目录', icon: Folder },
            { id: 'custom', label: '自主规划', icon: Plus },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '8px 0',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? NM.cardBg : 'transparent',
                  color: isActive ? NM.gold : NM.textSub,
                  boxShadow: isActive ? NM.convexXs : 'none',
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 选项卡内容区域 */}
        <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
          {/* TAB 1: B站解析 */}
          {activeTab === 'bilibili' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgLighter,
                  fontSize: '11px',
                  color: NM.textSub,
                  lineHeight: '1.6',
                  boxShadow: NM.insetXs,
                }}
              >
                📺 <b>B站解析</b>：支持粘贴 B 站视频链接、分享短链或 BV 号（如 <code>BV1xx411c7mD</code>）。系统将自动拉取课程名、UP主及分P分集目录与时长。
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: NM.textSub,
                    marginBottom: '6px',
                  }}
                >
                  视频链接 / BV号
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="如: https://www.bilibili.com/video/BV1... 或 BV号"
                    value={biliInput}
                    onChange={e => setBiliInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: NM.borderSoft,
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetSm,
                      fontSize: '12px',
                      color: NM.textMain,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleParseBilibili}
                    disabled={isParsingBili}
                    style={{
                      padding: '0 14px',
                      borderRadius: '10px',
                      backgroundColor: NM.cardBg,
                      boxShadow: NM.convexSm,
                      border: NM.borderLight,
                      color: NM.gold,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isParsingBili ? 'wait' : 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {isParsingBili ? '解析中' : '解析'}
                  </button>
                </div>
              </div>

              {/* 快捷示例 */}
              {!biliParsedCourse && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: NM.textMuted }}>
                  <span>试一试示例:</span>
                  <button
                    onClick={() => setBiliInput('BV14J4114768')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: NM.gold,
                      cursor: 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    前端精讲(BV14J4114768)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => setBiliInput('BV1xx411c7mD')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: NM.gold,
                      cursor: 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    交流演示(BV1xx411c7mD)
                  </button>
                </div>
              )}

              {/* 解析成功预览 */}
              {biliParsedCourse && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* 课程封面 */}
                  {biliParsedCourse.coverUrl && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '110px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: NM.insetSm,
                      }}
                    >
                      <img
                        src={biliParsedCourse.coverUrl}
                        alt="课程封面"
                        referrerPolicy="no-referrer"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '8px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        共 {biliParsedCourse.totalChapters} 讲
                      </div>
                    </div>
                  )}

                  {/* 课程名称（可编辑微调） */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: NM.textSub,
                        marginBottom: '4px',
                      }}
                    >
                      课程名称 (可编辑)
                    </label>
                    <input
                      type="text"
                      value={biliParsedTitle}
                      onChange={e => setBiliParsedTitle(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: NM.borderSoft,
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: NM.textMain,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* UP主 / 讲师（可编辑微调） */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: NM.textSub,
                          marginBottom: '4px',
                        }}
                      >
                        UP主 / 讲师
                      </label>
                      <input
                        type="text"
                        value={biliParsedAuthor}
                        onChange={e => setBiliParsedAuthor(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: NM.borderSoft,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetXs,
                          fontSize: '11px',
                          color: NM.textMain,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: NM.textSub,
                          marginBottom: '4px',
                        }}
                      >
                        预计总学时
                      </label>
                      <div
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          backgroundColor: NM.bgLighter,
                          fontSize: '11px',
                          color: NM.amber,
                          fontWeight: 800,
                        }}
                      >
                        {formatDuration(biliParsedCourse.totalDurationSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* 分P章节列表预览 */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: NM.textSub }}>
                        解析目录清单 (共 {biliParsedCourse.totalChapters} 讲)
                      </span>
                    </div>
                    <div
                      style={{
                        maxHeight: '130px',
                        overflowY: 'auto',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        fontSize: '11px',
                        color: NM.textSub,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      {biliParsedCourse.chapters.slice(0, 20).map(c => (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                          >
                            {c.title}
                          </span>
                          <span style={{ fontSize: '10px', color: NM.textMuted, flexShrink: 0 }}>
                            {formatDuration(c.durationSeconds)}
                          </span>
                        </div>
                      ))}
                      {biliParsedCourse.chapters.length > 20 && (
                        <div style={{ color: NM.textMuted, textAlign: 'center', paddingTop: '4px' }}>
                          ...已同步全部 {biliParsedCourse.chapters.length} 讲
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBili}
                    style={{
                      marginTop: '4px',
                      padding: '10px 0',
                      borderRadius: '10px',
                      backgroundColor: NM.amber,
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: NM.convexSm,
                      cursor: 'pointer',
                    }}
                  >
                    加入看板待学库
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 网盘目录导入 */}
          {activeTab === 'pan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgLighter,
                  fontSize: '11px',
                  color: NM.textSub,
                  lineHeight: '1.6',
                  boxShadow: NM.insetXs,
                }}
              >
                📁 <b>网盘目录智能识别</b>：在百度网盘/夸克全选文件并“复制文件名列表”，将文本直接粘贴在下方。系统将自动清洗文件扩展名并生成清晰章节树。
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: NM.textSub, marginBottom: '4px' }}>
                  课程名称 *
                </label>
                <input
                  type="text"
                  placeholder="如: 【网盘精选】分布式架构与系统设计课"
                  value={panTitle}
                  onChange={e => setPanTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '12px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: NM.textSub, marginBottom: '4px' }}>
                  讲师 / 机构 (选填)
                </label>
                <input
                  type="text"
                  placeholder="如: 架构总监"
                  value={panAuthor}
                  onChange={e => setPanAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '12px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: NM.textSub, marginBottom: '4px' }}>
                  复制的网盘文件列表文本 *
                </label>
                <textarea
                  rows={6}
                  placeholder={`在此粘贴多行文件名列表，如：
01 架构导学与环境配置.mp4
02 高并发缓存穿透解决方案.flv
03 分布式事务TCC落地.mp4
...`}
                  value={panText}
                  onChange={e => setPanText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '11px',
                    color: NM.textMain,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <button
                onClick={handleConfirmPan}
                style={{
                  marginTop: '4px',
                  padding: '10px 0',
                  borderRadius: '10px',
                  backgroundColor: NM.amber,
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: NM.convexSm,
                  cursor: 'pointer',
                }}
              >
                结构化导入看板
              </button>
            </div>
          )}

          {/* TAB 3: 自主规划 */}
          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgLighter,
                  fontSize: '11px',
                  color: NM.textSub,
                  lineHeight: '1.6',
                  boxShadow: NM.insetXs,
                }}
              >
                🎯 <b>自定义攻克</b>：自学某一本书或专业技术时，规划拆解为具体的打卡里程碑，开启专注追踪。
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: NM.textSub, marginBottom: '4px' }}>
                  攻克目标 / 课程名 *
                </label>
                <input
                  type="text"
                  placeholder="如: 21天精通英语长难句拆解"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '12px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: NM.textSub, marginBottom: '4px' }}>
                  自拟章节 / 讲数 (默认12)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customChapters}
                  onChange={e => setCustomChapters(parseInt(e.target.value, 10) || 10)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '12px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={handleConfirmCustom}
                style={{
                  marginTop: '8px',
                  padding: '10px 0',
                  borderRadius: '10px',
                  backgroundColor: NM.amber,
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: NM.convexSm,
                  cursor: 'pointer',
                }}
              >
                创建攻克计划
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 极简 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#362E22',
            color: '#FAF7F0',
            padding: '7px 15px',
            borderRadius: '18px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            zIndex: 110,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
