import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Calculator, CheckSquare } from 'lucide-react';
import { MemoChapter, MemoCategory } from '../../../../core/memo/memoTypes';
import { MemoBudgetBar } from './MemoBudgetBar';
import { MemoTodoBar } from './MemoTodoBar';
import { MemoTodoListInteractive } from './MemoTodoListInteractive';
import {
  parseExpensesFromContent,
  appendOrUpdateSummaryLine,
} from '../../../../core/memo/budgetCalculator';
import {
  parseTodoList,
  convertTodoListStyle,
  detectDominantStyle,
  formatTodoItem,
  TodoItem,
  TodoPrefixStyle,
} from '../../../../core/memo/todoEngine';

interface MemoStationeryPadProps {
  category: MemoCategory | null;
  chapter: MemoChapter | null;
  onUpdateChapter: (updated: MemoChapter) => void;
  onOpenEditTitles: () => void;
  onDeleteCurrentChapter?: () => void;
}

export const MemoStationeryPad: React.FC<MemoStationeryPadProps> = ({
  category,
  chapter,
  onUpdateChapter,
  onOpenEditTitles,
  onDeleteCurrentChapter,
}) => {
  if (!category || !chapter) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FEF3C7',
          padding: '20px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: '#FFFFFF',
            border: '2.5px solid #502428',
            borderRadius: '16px',
            boxShadow: '0 4px 0 #502428',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📝</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#502428' }}>
            当前分类暂无篇章
          </span>
          <span style={{ fontSize: '11px', color: '#78350F', display: 'block', marginTop: '4px' }}>
            点击下方深黄色栏目创建新篇章开始记录吧
          </span>
        </div>
      </div>
    );
  }

  const pages = chapter.pages && chapter.pages.length > 0 ? chapter.pages : [''];
  const currentPageIdx = Math.min(chapter.currentPageIndex || 0, pages.length - 1);
  const currentContent = pages[currentPageIdx] || '';

  // 引用受控 textarea，保证光标在中间输入字符时不发生跳跃
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 翻页处理
  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      onUpdateChapter({
        ...chapter,
        currentPageIndex: currentPageIdx - 1,
        updatedAt: Date.now(),
      });
    }
  };

  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      onUpdateChapter({
        ...chapter,
        currentPageIndex: currentPageIdx + 1,
        updatedAt: Date.now(),
      });
    }
  };

  // 加新纸张
  const handleAddPage = () => {
    const nextPages = [...pages, ''];
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      currentPageIndex: nextPages.length - 1,
      updatedAt: Date.now(),
    });
  };

  // 删除当前纸张
  const handleDeletePage = () => {
    if (pages.length <= 1) {
      // 仅剩一页时清空文本
      const nextPages = [''];
      onUpdateChapter({
        ...chapter,
        pages: nextPages,
        currentPageIndex: 0,
        updatedAt: Date.now(),
      });
      return;
    }
    const nextPages = pages.filter((_, idx) => idx !== currentPageIdx);
    const nextIdx = Math.min(currentPageIdx, nextPages.length - 1);
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      currentPageIndex: nextIdx,
      updatedAt: Date.now(),
    });
  };

  // 文本内容修改
  const handleContentChange = (newText: string) => {
    const nextPages = [...pages];
    nextPages[currentPageIdx] = newText;
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      updatedAt: Date.now(),
    });
  };

  // 是否属于记账/包含预算属性的分类
  const isAccountingCategory = Boolean(
    category.id === 'cat_accounting' ||
    category.name.includes('账') ||
    category.name.includes('开销') ||
    category.name.includes('预算') ||
    category.name.includes('消费') ||
    chapter.budgetTotal !== undefined
  );

  // 可用预算总额（优先取篇章设置的值，默认 500）
  const budgetTotal = chapter.budgetTotal ?? 500;

  // 响应式解析当前页面书写的各项开销并自动扣减可用金额
  const calcResult = useMemo(() => {
    return parseExpensesFromContent(currentContent, budgetTotal);
  }, [currentContent, budgetTotal]);

  const handleUpdateBudget = (newBudget: number) => {
    onUpdateChapter({
      ...chapter,
      budgetTotal: newBudget,
      updatedAt: Date.now(),
    });
  };

  const handleApplySummaryToNote = () => {
    const nextText = appendOrUpdateSummaryLine(
      currentContent,
      calcResult.totalExpense,
      calcResult.remainingBalance
    );
    handleContentChange(nextText);
  };

  // 是否属于待办清单分类
  const isTodoCategory = Boolean(
    category.id === 'cat_todo' ||
    category.name.includes('待办') ||
    category.name.includes('清单') ||
    category.name.includes('计划') ||
    category.name.toLowerCase().includes('todo')
  );

  // 待办模式下：默认启用左侧专属打钩的交互清单模式
  const [isTodoInteractive, setIsTodoInteractive] = useState<boolean>(true);
  // 当前符号排列风格（打钩 | 1,2,3 | ①②③ | 圆点 | 星标）
  const [todoStyle, setTodoStyle] = useState<TodoPrefixStyle>('checkbox');

  // 解析待办条目列表
  const todoItems = useMemo(() => {
    return parseTodoList(currentContent);
  }, [currentContent]);

  // 当切换篇章或页码时，智能侦测当前内容的主导符号风格
  useEffect(() => {
    if (isTodoCategory && currentContent) {
      const dominant = detectDominantStyle(currentContent);
      setTodoStyle(dominant);
    }
  }, [chapter.id, currentPageIdx, isTodoCategory]);

  // 切换排列符号风格（一键批量转换）
  const handleChangeTodoStyle = (newStyle: TodoPrefixStyle) => {
    setTodoStyle(newStyle);
    const converted = convertTodoListStyle(currentContent, newStyle);
    handleContentChange(converted);
  };

  // 交互式待办列表更新
  const handleUpdateTodoItems = (newItems: TodoItem[]) => {
    const newContent = newItems
      .map((item, idx) => formatTodoItem(item, todoStyle, idx))
      .join('\n');
    handleContentChange(newContent);
  };

  // 快捷追加一项
  const handleAddTodoItem = () => {
    const newItems = [...todoItems];
    newItems.push({
      id: `todo_${Date.now()}`,
      rawText: '',
      cleanText: '',
      isDone: false,
      prefixStyle: todoStyle,
      prefixDisplay: '',
    });
    handleUpdateTodoItems(newItems);
  };

  // 在指定行插入新项
  const handleAddNewAt = (targetIdx: number) => {
    const newItems = [...todoItems];
    const newItem: TodoItem = {
      id: `todo_${Date.now()}`,
      rawText: '',
      cleanText: '',
      isDone: false,
      prefixStyle: todoStyle,
      prefixDisplay: '',
    };
    newItems.splice(targetIdx, 0, newItem);
    handleUpdateTodoItems(newItems);
  };

  const todoDoneCount = useMemo(() => {
    return todoItems.filter((it) => it.isDone).length;
  }, [todoItems]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#FEF3C7', // 暖黄书页衬底
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '10px 10px 6px 10px',
      }}
    >
      {/* 1. 活页纸顶端：一级标题与二级标题（点击可编辑） */}
      <div
        style={{
          background: '#FFFBEB',
          border: '2.5px solid #502428',
          borderRadius: '14px 14px 0 0',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px dashed #D97706',
          boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
          {/* 一级标题 */}
          <div
            onClick={onOpenEditTitles}
            title="点击修改标题"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 900,
                color: '#502428',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chapter.titleLevel1 || '未命名一级标题'}
            </span>
            <Edit3 size={11} color="#B45309" />
          </div>

          {/* 二级标题 */}
          <span
            onClick={onOpenEditTitles}
            title="点击修改标题"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#92400E',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            § {chapter.titleLevel2 || '未命名二级标题'}
          </span>
        </div>

        {/* 所属分类胶囊角标 */}
        <div
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            background: category.color,
            border: '1.5px solid #502428',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 900,
            boxShadow: '0 1px 0 #502428',
            flexShrink: 0,
            marginLeft: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {isAccountingCategory && <Calculator size={10} />}
          {isTodoCategory && <CheckSquare size={10} />}
          {category.name}
        </div>
      </div>

      {/* 2. 吸顶便携预算计算器条（记账场景） */}
      {isAccountingCategory && (
        <MemoBudgetBar
          calcResult={calcResult}
          onUpdateBudget={handleUpdateBudget}
        />
      )}

      {/* 2.5 待办吸顶工具栏（待办场景：进度条 + 符号排列选择器[√]/1,2,3/①②③/•/★） */}
      {isTodoCategory && (
        <MemoTodoBar
          totalCount={todoItems.length}
          doneCount={todoDoneCount}
          currentStyle={todoStyle}
          isInteractiveMode={isTodoInteractive}
          onChangeStyle={handleChangeTodoStyle}
          onToggleInteractiveMode={() => setIsTodoInteractive(!isTodoInteractive)}
          onAddTodo={handleAddTodoItem}
        />
      )}

      {/* 3. 手账纸张正文区（待办专属打钩互动清单 vs 自由手写纸） */}
      {isTodoCategory && isTodoInteractive ? (
        <MemoTodoListInteractive
          items={todoItems}
          currentStyle={todoStyle}
          onUpdateItems={handleUpdateTodoItems}
          onAddNewAt={handleAddNewAt}
        />
      ) : (
        <div
          style={{
            flex: 1,
            background: '#FFFDF9',
            border: '2.5px solid #502428',
            borderTop: 'none',
            borderBottom: 'none',
            padding: '8px 12px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8DFD5 28px)',
            backgroundAttachment: 'local',
            overflow: 'hidden',
          }}
        >
          <textarea
            ref={textareaRef}
            value={currentContent}
            onChange={(e) => {
              const target = e.target;
              const cursor = target.selectionStart;
              handleContentChange(target.value);
              // 双重锁定：在 React 本轮与下一微任务帧中锁定光标位置，杜绝跳到末尾
              requestAnimationFrame(() => {
                if (textareaRef.current) {
                  textareaRef.current.setSelectionRange(cursor, cursor);
                }
              });
            }}
            placeholder={
              isAccountingCategory
                ? `在此记录每一笔收支明细...\n• 格式如：9月22日 暖阳拿铁 ￥18.00\n• 每一笔支出都会自动从上方可用金额中扣减\n• 余额实时计算，点击右上方【盖印总计】可同步写入末尾`
                : `在此书写【${category.name}】内容...\n• 可以记录每一笔收支明细\n• 可以随笔写下生活灵感\n• 纸张不够可在下方点击【加新纸】`
            }
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '13.5px',
              lineHeight: '28px',
              color: '#292524',
              fontFamily: '"ZCOOL KuaiLe", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              boxSizing: 'border-box',
              padding: 0,
              margin: 0,
            }}
          />
        </div>
      )}

      {/* 3. 活页纸底部：页码指示、翻页与加新纸按钮 */}
      <div
        style={{
          background: '#FFFBEB',
          border: '2.5px solid #502428',
          borderRadius: '0 0 14px 14px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 3px 0 #502428',
        }}
      >
        {/* 左侧页码指示 */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#78350F',
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
          }}
        >
          📄 第 {currentPageIdx + 1} / {pages.length} 页
        </span>

        {/* 中间翻页按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPageIdx === 0}
            title="上一页"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentPageIdx > 0 ? '#FDE68A' : '#F3F4F6',
              border: '1.5px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPageIdx > 0 ? 'pointer' : 'not-allowed',
              opacity: currentPageIdx > 0 ? 1 : 0.4,
              padding: 0,
            }}
          >
            <ChevronLeft size={14} color="#502428" strokeWidth={3} />
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPageIdx >= pages.length - 1}
            title="下一页"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentPageIdx < pages.length - 1 ? '#FDE68A' : '#F3F4F6',
              border: '1.5px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPageIdx < pages.length - 1 ? 'pointer' : 'not-allowed',
              opacity: currentPageIdx < pages.length - 1 ? 1 : 0.4,
              padding: 0,
            }}
          >
            <ChevronRight size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 右侧：加新纸与删页 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {pages.length > 1 && (
            <button
              onClick={handleDeletePage}
              title="删除此页"
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '8px',
                background: '#FEE2E2',
                border: '1.5px solid #502428',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 800,
                color: '#DC2626',
              }}
            >
              <Trash2 size={11} />
              删页
            </button>
          )}

          <button
            onClick={handleAddPage}
            title="追加新纸张"
            style={{
              height: '24px',
              padding: '0 8px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
              border: '1.5px solid #502428',
              boxShadow: '0 1.5px 0 #502428',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            <Plus size={12} strokeWidth={3.5} />
            加新纸
          </button>
        </div>
      </div>
    </div>
  );
};
