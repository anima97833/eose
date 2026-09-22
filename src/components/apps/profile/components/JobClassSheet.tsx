import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2, Plus, Camera, ChevronLeft, ChevronRight, Edit3, MapPin, Coins } from 'lucide-react';
import { RPGClass } from '../../../../core/rpg/types';
import { getAllClassImages, saveClassImage, deleteClassImage } from '../../../../core/rpg/classImageStorage';

interface JobClassSheetProps {
  classes: RPGClass[];
  currentClassId: string;
  onSelectClass: (id: string) => void;
  onAddClass: (newClass: RPGClass) => void;
  onDeleteClass: (id: string) => void;
  onUpdateClass?: (updatedClass: RPGClass) => void;
  onClose: () => void;
}

export const JobClassSheet: React.FC<JobClassSheetProps> = ({
  classes,
  currentClassId,
  onSelectClass,
  onAddClass,
  onDeleteClass,
  onUpdateClass,
  onClose,
}) => {
  // 当前正在浏览的职业卡片索引
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = classes.findIndex((c) => c.id === currentClassId);
    return idx >= 0 ? idx : 0;
  });

  // IndexedDB 中的职业大图映射：{ [classId]: base64DataUrl }
  const [classImageMap, setClassImageMap] = useState<Record<string, string>>({});

  // 弹窗状态
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 表单状态（编辑/新增通用）
  const [formTitle, setFormTitle] = useState('');
  const [formJob, setFormJob] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageData, setFormImageData] = useState<string | null>(null);

  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg.slice(0, 5));
    setTimeout(() => setToastMsg(null), 1800);
  };

  // 初始化从 IndexedDB 加载全部职业立绘
  useEffect(() => {
    let isMounted = true;
    getAllClassImages().then((map) => {
      if (isMounted) {
        setClassImageMap(map);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentClass = classes[currentIndex] || classes[0];

  // 左右翻页
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : classes.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < classes.length - 1 ? prev + 1 : 0));
  };

  // 触发当前卡片更换图片
  const handleTriggerUpload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentClass) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveClassImage(currentClass.id, dataUrl);
      setClassImageMap((prev) => ({ ...prev, [currentClass.id]: dataUrl }));
      showToast('图片已存入');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 弹窗内的图片上传
  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormImageData(reader.result as string);
      showToast('图片已读取');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 打开编辑当前职业
  const handleOpenEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentClass) return;
    setFormTitle(currentClass.title);
    setFormJob(currentClass.job || '');
    setFormSalary(currentClass.salary || '25K - 35K');
    setFormLocation(currentClass.location || '上海 · 徐汇');
    setFormDesc(currentClass.desc || '');
    setFormImageData(classImageMap[currentClass.id] || null);
    setIsEditing(true);
  };

  // 打开新增职业
  const handleOpenAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFormTitle('');
    setFormJob('');
    setFormSalary('20K - 30K');
    setFormLocation('远程 · 居家');
    setFormDesc('');
    setFormImageData(null);
    setIsAdding(true);
  };

  // 保存新增
  const handleSaveAdd = async () => {
    if (!formTitle.trim()) return;
    const newId = `class_${Date.now()}`;
    const newClass: RPGClass = {
      id: newId,
      title: formTitle.trim().slice(0, 5), // <= 5 字
      job: formJob.trim().slice(0, 6) || '自由开发者',
      mainAttr: 'INT',
      desc: formDesc.trim() || '追寻理想职业生涯。',
      salary: formSalary.trim() || '25K - 35K',
      location: formLocation.trim() || '上海 · 徐汇',
      icon: '💼',
    };

    if (formImageData) {
      await saveClassImage(newId, formImageData);
      setClassImageMap((prev) => ({ ...prev, [newId]: formImageData }));
    }

    onAddClass(newClass);
    setCurrentIndex(classes.length); // 跳到新卡片
    showToast('添加成功');
    setIsAdding(false);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!currentClass || !formTitle.trim()) return;
    const updated: RPGClass = {
      ...currentClass,
      title: formTitle.trim().slice(0, 5),
      job: formJob.trim().slice(0, 6) || currentClass.job,
      salary: formSalary.trim() || '25K - 35K',
      location: formLocation.trim() || '上海 · 徐汇',
      desc: formDesc.trim() || currentClass.desc,
    };

    if (formImageData) {
      await saveClassImage(currentClass.id, formImageData);
      setClassImageMap((prev) => ({ ...prev, [currentClass.id]: formImageData }));
    }

    if (onUpdateClass) {
      onUpdateClass(updated);
    } else {
      // 降级更新
      onDeleteClass(currentClass.id);
      onAddClass(updated);
    }
    showToast('修改成功');
    setIsEditing(false);
  };

  // 删除当前职业
  const handleDeleteCurrent = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentClass) return;
    if (classes.length <= 1) {
      showToast('至少留一项');
      return;
    }
    await deleteClassImage(currentClass.id);
    setClassImageMap((prev) => {
      const copy = { ...prev };
      delete copy[currentClass.id];
      return copy;
    });
    onDeleteClass(currentClass.id);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    showToast('职业已删除');
  };

  const hasCustomImage = currentClass && (!!classImageMap[currentClass.id] || !!currentClass.imageUrl);
  const currentImgSrc = currentClass ? classImageMap[currentClass.id] || currentClass.imageUrl : null;
  const isSelected = currentClass && currentClass.id === currentClassId;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(45, 30, 25, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* 隐藏的图片文件上传 input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 浮动 Toast 提示 (<= 5 字) */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            background: 'rgba(80, 42, 36, 0.95)',
            color: '#FFFFFF',
            padding: '7px 18px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 主面板容器（深度对齐参考图：暖杏色写字板基座 + 顶端金属夹具 + 米黄便签纸板） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '88%',
          background: '#EFA387', // 参考图同款暖杏粉实木写字板色
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '3px solid #502A24',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(60, 25, 20, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          padding: '24px 16px 20px',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
        }}
      >
        {/* ================= 顶端金属板夹具（对齐参考图顶部夹子） ================= */}
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '130px',
            height: '32px',
            background: 'linear-gradient(180deg, #E6D6C6 0%, #D8C2B0 100%)',
            border: '2.5px solid #502A24',
            borderRadius: '8px 8px 4px 4px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          {/* 金属夹镂空中缝与铆钉 */}
          <div
            style={{
              width: '42px',
              height: '8px',
              borderRadius: '4px',
              background: '#502A24',
              opacity: 0.65,
            }}
          />
        </div>

        {/* 右上角圆形手绘关闭按键 (参考图同款柔粉底色加粗 X) */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2.5px solid #502A24',
            background: '#FFAEA0',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
            zIndex: 25,
            fontWeight: 900,
          }}
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* 左侧翻页指示箭头 (参考图同款米黄圆角大箭头) */}
        <button
          onClick={handlePrev}
          title="上一职业"
          style={{
            position: 'absolute',
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: '32px',
            height: '46px',
            borderRadius: '8px 16px 16px 8px',
            background: '#FFEAA7',
            border: '2.5px solid #502A24',
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '2px 3px 6px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronLeft size={22} color="#502A24" strokeWidth={3} />
        </button>

        {/* 右侧翻页指示箭头 (参考图同款米黄圆角大箭头) */}
        <button
          onClick={handleNext}
          title="下一职业"
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: '32px',
            height: '46px',
            borderRadius: '16px 8px 8px 16px',
            background: '#FFEAA7',
            border: '2.5px solid #502A24',
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '-2px 3px 6px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronRight size={22} color="#502A24" strokeWidth={3} />
        </button>

        {/* ================= 内嵌米黄便签纸板（对齐参考图中央纸质主体） ================= */}
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            background: '#FAF4E4', // 参考图同款温润米黄纸张
            border: '2.5px solid #502A24',
            borderRadius: '16px',
            padding: '14px 16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 10px rgba(0,0,0,0.12)',
          }}
        >
          {/* 左下角仿真折角（对齐参考图左下角的翻页卷边 dog-ear） */}
          <div
            style={{
              position: 'absolute',
              bottom: '-2.5px',
              left: '-2.5px',
              width: '20px',
              height: '20px',
              background: '#FAF4E4',
              borderTop: '2.5px solid #502A24',
              borderRight: '2.5px solid #502A24',
              borderBottomLeftRadius: '4px',
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
              boxShadow: '-2px 2px 4px rgba(0,0,0,0.1)',
            }}
          />

          {/* 1. 顶部小胶囊标头（对齐参考图 [ 🎃 Bono ]） */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FDF0DB',
              border: '1.5px solid #8D5642',
              borderRadius: '14px',
              padding: '2px 14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: '15px' }}>{currentClass?.icon || '🎃'}</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#502A24',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              {currentClass?.title || '未命名'}
            </span>
          </div>

          {/* 顶部右侧：轻巧感叹号小徽记（对齐参考图 (!)） */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#EFA387',
              border: '1.5px solid #502A24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
            }}
          >
            !
          </div>

          {/* 2. 中间大插画/自定图片（对齐参考图中部可爱吸血鬼浣熊） */}
          <div
            onClick={handleTriggerUpload}
            title="点击更换图片"
            style={{
              width: '105px',
              height: '105px',
              margin: '8px 0 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* 上传相机快捷按钮 */}
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #502A24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
            >
              <Camera size={12} color="#502A24" />
            </div>

            {hasCustomImage ? (
              <img
                src={currentImgSrc!}
                alt="class"
                style={{
                  width: '94%',
                  height: '94%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(80, 42, 36, 0.2))',
                }}
              />
            ) : (
              /* 参考图同款生动萌系插画底蕴 */
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFF3DE 40%, #F5DFBA 100%)',
                  border: '2px dashed #B8896C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))',
                }}
              >
                {currentClass?.icon || '🧙'}
              </div>
            )}
          </div>

          {/* 3. 职业名称（下面职业名称，支持自定义名字） */}
          <div
            style={{
              fontSize: '16px',
              fontWeight: 900,
              color: '#502A24',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {currentClass?.job || '自由探索者'}
          </div>

          {/* 4. 丝带条 1：期望薪资（对齐参考图 Funds 丝带横幅） */}
          <div style={{ width: '100%', marginBottom: '8px' }}>
            {/* 丝带飘带标头 */}
            <div
              style={{
                background: '#F5B099',
                border: '2px solid #502A24',
                borderRadius: '8px',
                padding: '2px 0',
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 900,
                textShadow: '0 1px 0 #502A24',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 0 #502A24',
                position: 'relative',
              }}
            >
              期望薪资
            </div>

            {/* 薪资内容 (参考图 292 -> 656 金币数值条) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '6px 0 2px',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#FBBF24',
                  border: '1.5px solid #78350F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900,
                  color: '#78350F',
                }}
              >
                $
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#422817',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                }}
              >
                {currentClass?.salary || '25K - 35K'}
              </span>
            </div>
          </div>

          {/* 5. 丝带条 2：期望工作地（对齐参考图 Favorite Bread 丝带横幅） */}
          <div style={{ width: '100%', marginBottom: '10px' }}>
            {/* 丝带飘带标头 */}
            <div
              style={{
                background: '#F5B099',
                border: '2px solid #502A24',
                borderRadius: '8px',
                padding: '2px 0',
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 900,
                textShadow: '0 1px 0 #502A24',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 0 #502A24',
              }}
            >
              期望工作地
            </div>

            {/* 工作地内容 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 0 2px',
              }}
            >
              <MapPin size={15} color="#E05D44" />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#422817',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                }}
              >
                {currentClass?.location || '上海 · 徐汇'}
              </span>
            </div>
          </div>

          {/* 6. 底部操作胶囊按键组 (严格控制文案 <= 5 字) */}
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            {/* 选用 / 任职状态 */}
            <button
              onClick={() => {
                if (currentClass) {
                  onSelectClass(currentClass.id);
                  showToast('已任职');
                }
              }}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '12px',
                border: '2px solid #502A24',
                background: isSelected ? '#A7F3D0' : '#FEF3C7',
                color: isSelected ? '#065F46' : '#78350F',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 2px 0 #502A24',
              }}
            >
              {isSelected ? '任职中' : '选此职业'}
            </button>

            {/* 编辑按键 */}
            <button
              onClick={handleOpenEdit}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: '2px solid #502A24',
                background: '#FFFFFF',
                color: '#502A24',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 2px 0 #502A24',
              }}
            >
              <Edit3 size={12} />
              <span>编辑</span>
            </button>

            {/* 新增按键 */}
            <button
              onClick={handleOpenAdd}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: '2px solid #502A24',
                background: '#FDF0DB',
                color: '#502A24',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 2px 0 #502A24',
              }}
            >
              <Plus size={12} />
              <span>添职业</span>
            </button>
          </div>
        </div>

        {/* 底部点状进度指示器 */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {classes.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? '16px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: i === currentIndex ? '#502A24' : 'rgba(80, 42, 36, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* ================= 编辑 / 新增弹窗 ================= */}
        {(isEditing || isAdding) && (
          <div
            onClick={() => {
              setIsEditing(false);
              setIsAdding(false);
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(50, 30, 25, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '290px',
                background: '#FAF4E4',
                borderRadius: '20px',
                border: '3px solid #502A24',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
              }}
            >
              <input
                type="file"
                ref={formFileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFormFileChange}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#502A24' }}>
                  {isEditing ? '编辑职业' : '添加职业'}
                </span>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                  }}
                  style={{ background: 'none', border: 'none', color: '#502A24', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 点击上传/更换图片槽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  onClick={() => formFileInputRef.current?.click()}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    border: '2px dashed #8D5642',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {formImageData ? (
                    <img src={formImageData} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Camera size={20} color="#8D5642" />
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#6B4A34', fontWeight: 700 }}>
                  点击选图片
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="职业名"
                  maxLength={5}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid #502A24',
                    fontSize: '12px',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                />
                <input
                  type="text"
                  placeholder="职位全称"
                  maxLength={10}
                  value={formJob}
                  onChange={(e) => setFormJob(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid #502A24',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>

              <input
                type="text"
                placeholder="期望薪资"
                value={formSalary}
                onChange={(e) => setFormSalary(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502A24',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              <input
                type="text"
                placeholder="期望工作地"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502A24',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={isEditing ? handleSaveEdit : handleSaveAdd}
                  disabled={!formTitle.trim()}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '10px',
                    background: formTitle.trim() ? '#E05D44' : '#D1D5DB',
                    color: '#FFFFFF',
                    border: '2px solid #502A24',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: formTitle.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: '0 2px 0 #502A24',
                  }}
                >
                  保存
                </button>

                {isEditing && (
                  <button
                    onClick={handleDeleteCurrent}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '2px solid #502A24',
                      fontWeight: 900,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #502A24',
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 动画 */}
      <style>{`
        @keyframes slideUpSpring {
          0% {
            transform: translateY(100%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes backdropFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
