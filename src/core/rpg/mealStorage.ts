import { db, RPGMealRecord } from '../storage/db';

export const DEFAULT_MEALS: RPGMealRecord[] = [
  {
    id: 'meal_flower',
    date: '2026.09.22',
    mealType: 'breakfast',
    dishName: '花见果子',
    rating: 1,
    review: '粉白花瓣微甜不腻，开启清爽早晨。',
    badgeKey: 'flower',
    slotIndex: 0,
    updatedAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'meal_manju',
    date: '2026.09.22',
    mealType: 'breakfast',
    dishName: '红豆馒头',
    rating: 2,
    review: '松软外皮包裹绵密红豆沙，元气满满！',
    badgeKey: 'manju',
    slotIndex: 1,
    updatedAt: Date.now() - 3600000 * 7,
  },
  {
    id: 'meal_rabbit',
    date: '2026.09.22',
    mealType: 'lunch',
    dishName: '雪兔果子',
    rating: 2,
    review: '两只小兔晶莹剔透，软糯Q弹超可爱！',
    badgeKey: 'rabbit',
    slotIndex: 2,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'meal_sakura',
    date: '2026.09.22',
    mealType: 'lunch',
    dishName: '樱饼果子',
    rating: 2,
    review: '盐渍樱叶咸甜交织，春日风味十足。',
    badgeKey: 'sakura',
    slotIndex: 3,
    updatedAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'meal_fruit',
    date: '2026.09.22',
    mealType: 'dinner',
    dishName: '时令果子',
    rating: 2,
    review: '柿子与白桃造型，果香浓郁令人心醉。',
    badgeKey: 'fruit',
    slotIndex: 4,
    updatedAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'meal_raindrop',
    date: '2026.09.22',
    mealType: 'dinner',
    dishName: '水信玄饼',
    rating: 3,
    review: '如水珠般清澈剔透，入口即化的极致治愈。',
    badgeKey: 'raindrop',
    slotIndex: 5,
    updatedAt: Date.now(),
  },
  {
    id: 'meal_strawberry',
    date: '2026.09.21',
    mealType: 'dinner',
    dishName: '草莓福袋',
    rating: 3,
    review: '新鲜草莓配上软绵大福，酸甜多汁超满足！',
    badgeKey: 'strawberry',
    slotIndex: 6,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'meal_giftset',
    date: '2026.09.21',
    mealType: 'snack',
    dishName: '心愿礼盒',
    rating: 3,
    review: '雅致典雅的点心锦盒，每一枚都是惊喜。',
    badgeKey: 'giftset',
    slotIndex: 7,
    updatedAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'meal_shop',
    date: '2026.09.20',
    mealType: 'snack',
    dishName: '和风茶点',
    rating: 3,
    review: '茶香醇厚茶点精致，度过悠闲下午茶时光。',
    badgeKey: 'shop',
    slotIndex: 8,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

// 初始化并获取全部记录（若为空自动填入预设）
export async function getAllMealRecords(): Promise<RPGMealRecord[]> {
  try {
    const list = await db.rpg_meal_records.toArray();
    if (!list || list.length === 0) {
      // 预存预设数据
      await db.rpg_meal_records.bulkPut(DEFAULT_MEALS);
      return DEFAULT_MEALS;
    }
    return list.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
  } catch (err) {
    console.warn('读取美食手账失败，返回预设数据:', err);
    return DEFAULT_MEALS;
  }
}

// 保存单条记录
export async function saveMealRecord(record: RPGMealRecord): Promise<void> {
  try {
    await db.rpg_meal_records.put({
      ...record,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('保存美食手账失败:', err);
  }
}

// 删除记录
export async function deleteMealRecord(id: string): Promise<void> {
  try {
    await db.rpg_meal_records.delete(id);
  } catch (err) {
    console.error('删除美食手账失败:', err);
  }
}

// 重置为默认
export async function resetMealRecords(): Promise<RPGMealRecord[]> {
  try {
    await db.rpg_meal_records.clear();
    await db.rpg_meal_records.bulkPut(DEFAULT_MEALS);
    return DEFAULT_MEALS;
  } catch (err) {
    console.error('重置美食手账失败:', err);
    return DEFAULT_MEALS;
  }
}
