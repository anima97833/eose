import React, { useState, useRef, useEffect } from 'react';
import { Coins, TrendingDown, Sparkles, AlertTriangle, Check, X } from 'lucide-react';
import { ExpenseParseResult } from '../../../../core/memo/budgetCalculator';

interface MemoBudgetBarProps {
  calcResult: ExpenseParseResult;
  onUpdateBudget: (newBudget: number) => void;
}

const PRESET_BUDGETS = [200, 500, 1000, 2000, 3000];

export const MemoBudgetBar: React.FC<MemoBudgetBarProps> = ({
  calcResult,
  onUpdateBudget,
}) => {
  const { items, totalExpense, budgetTotal, remainingBalance, isOverBudget } = calcResult;

  // 状态：编辑可用预算面板
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState(budgetTotal.toString());

  // 状态：展开支出明细
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const editPopoverRef = useRef<HTMLDivElement>(null);
  const detailsPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempBudgetInput(budgetTotal.toString());
  }, [budgetTotal]);

  // 点击外部关闭弹层
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editPopoverRef.current && !editPopoverRef.current.contains(e.target as Node)) {
        setIsEditingBudget(false);
      }
      if (detailsPopoverRef.current && !detailsPopoverRef.current.contains(e.target as Node)) {
        setShowDetailsPopup(false);
      }
    };
    if (isEditingBudget || showDetailsPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingBudget, showDetailsPopup]);

  const handleSaveBudget = (amount?: number) => {
    const val = amount !== undefined ? amount : parseFloat(tempBudgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
    }
    setIsEditingBudget(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        background: '#FFFBEB',
        borderLeft: '2.5px solid #502428',
        borderRight: '2.5px solid #502428',
        borderBottom: '2px dashed #E5D5C5',
        padding: '4px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'nowrap',
        height: '32px',
        boxSizing: 'border-box',
        boxShadow: 'inset 0 -1px 3px rgba(80, 36, 40, 0.04)',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* 紧凑数学等式：🪙 ￥500 − 📉 ￥75 = ✨ ￥425 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'nowrap',
        }}
      >
        {/* 1. 可用预算胶囊（点击可修改） */}
        <div
          onClick={() => {
            setIsEditingBudget(true);
            setShowDetailsPopup(false);
          }}
          title="点击调整可用预算"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: isEditingBudget ? '#FDE68A' : '#FEF3C7',
            border: '1.5px solid #D97706',
            borderRadius: '12px',
            padding: '1px 7px',
            height: '22px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            boxShadow: '0 1px 0 rgba(217, 119, 6, 0.25)',
            transition: 'all 0.12s ease',
            flexShrink: 0,
          }}
        >
          <Coins size={11} color="#B45309" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              color: '#78350F',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            ￥{budgetTotal}
          </span>
        </div>

        {/* 减号 */}
        <span style={{ color: '#9CA3AF', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>
          −
        </span>

        {/* 2. 支出胶囊（点击查看明细） */}
        <div
          onClick={() => {
            if (items.length > 0) {
              setShowDetailsPopup(!showDetailsPopup);
              setIsEditingBudget(false);
            }
          }}
          title={items.length > 0 ? `已识别 ${items.length} 笔支出 (点击查看明细)` : '在手账写下 ￥金额 自动识别'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: showDetailsPopup ? '#E5E7EB' : '#F3F4F6',
            border: '1.5px solid #9CA3AF',
            borderRadius: '12px',
            padding: '1px 7px',
            height: '22px',
            boxSizing: 'border-box',
            cursor: items.length > 0 ? 'pointer' : 'default',
            boxShadow: '0 1px 0 rgba(156, 163, 175, 0.25)',
            transition: 'all 0.12s ease',
            flexShrink: 0,
          }}
        >
          <TrendingDown size={11} color="#4B5563" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#374151',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            ￥{totalExpense.toFixed(1)}
          </span>
          {items.length > 0 && (
            <span
              style={{
                fontSize: '9px',
                background: '#E5E7EB',
                borderRadius: '6px',
                padding: '0 3px',
                color: '#4B5563',
                fontWeight: 800,
              }}
            >
              {items.length}
            </span>
          )}
        </div>

        {/* 等号 */}
        <span style={{ color: '#9CA3AF', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>
          =
        </span>

        {/* 3. 实时结余胶囊（绿意富余 / 警示赤字，空间开阔无遮挡） */}
        <div
          title={isOverBudget ? `预算透支 ￥${Math.abs(remainingBalance)}` : `可用结余 ￥${remainingBalance}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: isOverBudget ? '#FEF2F2' : '#ECFDF5',
            border: `1.5px solid ${isOverBudget ? '#EF4444' : '#10B981'}`,
            borderRadius: '12px',
            padding: '1px 8px',
            height: '22px',
            boxSizing: 'border-box',
            boxShadow: isOverBudget
              ? '0 1px 0 rgba(239, 68, 68, 0.25)'
              : '0 1px 0 rgba(16, 185, 129, 0.25)',
            flexShrink: 0,
          }}
        >
          {isOverBudget ? (
            <AlertTriangle size={11} color="#DC2626" />
          ) : (
            <Sparkles size={11} color="#059669" />
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              color: isOverBudget ? '#DC2626' : '#047857',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            {isOverBudget ? '-' : ''}￥{Math.abs(remainingBalance).toFixed(1)}
          </span>
        </div>
      </div>

      {/* 弹层 A：设定预算 Popover */}
      {isEditingBudget && (
        <div
          ref={editPopoverRef}
          style={{
            position: 'absolute',
            top: '30px',
            left: '8px',
            background: '#FFFDF9',
            border: '2px solid #502428',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 6px 16px rgba(80, 36, 40, 0.18)',
            zIndex: 40,
            width: '190px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#502428',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
              }}
            >
              🪙 设定可用预算
            </span>
            <button
              onClick={() => setIsEditingBudget(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#9CA3AF',
              }}
            >
              <X size={12} />
            </button>
          </div>

          {/* 预设档位 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '6px' }}>
            {PRESET_BUDGETS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleSaveBudget(amt)}
                style={{
                  padding: '2px 5px',
                  borderRadius: '6px',
                  border: '1px solid #D97706',
                  background: budgetTotal === amt ? '#FBBF24' : '#FEF3C7',
                  color: '#78350F',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ￥{amt}
              </button>
            ))}
          </div>

          {/* 自定义输入 */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: '#F9FAFB',
                border: '1.5px solid #502428',
                borderRadius: '7px',
                padding: '0 5px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 800 }}>￥</span>
              <input
                type="number"
                min="0"
                step="10"
                value={tempBudgetInput}
                onChange={(e) => setTempBudgetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                placeholder="金额"
                autoFocus
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#1F2937',
                  padding: '3px 2px',
                }}
              />
            </div>

            <button
              onClick={() => handleSaveBudget()}
              style={{
                padding: '0 7px',
                background: '#059669',
                border: '1.5px solid #502428',
                borderRadius: '7px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={13} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* 弹层 B：支出明细 Popover */}
      {showDetailsPopup && (
        <div
          ref={detailsPopoverRef}
          style={{
            position: 'absolute',
            top: '30px',
            left: '60px',
            background: '#FFFDF9',
            border: '2px solid #502428',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 6px 16px rgba(80, 36, 40, 0.18)',
            zIndex: 40,
            width: '190px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '5px',
              borderBottom: '1px dashed #D1D5DB',
              paddingBottom: '3px',
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#502428' }}>
              📝 开销 ({items.length}笔)
            </span>
            <button
              onClick={() => setShowDetailsPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#9CA3AF',
              }}
            >
              <X size={11} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '10.5px',
                  color: '#374151',
                  background: '#F9FAFB',
                  padding: '2px 5px',
                  borderRadius: '5px',
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '105px',
                  }}
                >
                  • {it.label}
                </span>
                <span style={{ fontWeight: 800, color: '#DC2626' }}>
                  -￥{it.amount.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
