export interface CityPreset {
  name: string;
  pinyin: string;
  lat: number;
  lng: number;
  zoom: number;
  district?: string;
}

// 国内主要城市及天津特色街区预置词典（离线秒搜，无需等待网络）
export const POPULAR_PRESET_CITIES: CityPreset[] = [
  // 天津专区（深度收录）
  { name: '天津市 (中心城区)', pinyin: 'tianjin', lat: 39.1256, lng: 117.1902, zoom: 14, district: '和平区' },
  { name: '天津 · 五大道历史街区', pinyin: 'wudadao', lat: 39.1098, lng: 117.1985, zoom: 16, district: '和平区' },
  { name: '天津之眼 (摩天轮)', pinyin: 'tianjinzhiyan', lat: 39.1528, lng: 117.1818, zoom: 16, district: '红桥区 · 三岔河口' },
  { name: '天津 · 意式风情区', pinyin: 'yishifengqingqu', lat: 39.1362, lng: 117.1956, zoom: 16, district: '河北区' },
  { name: '天津 · 津湾广场 / 解放桥', pinyin: 'jinwanguangchang', lat: 39.1315, lng: 117.2062, zoom: 16, district: '和平区 · 海河畔' },
  { name: '天津 · 南开大学 / 天津大学', pinyin: 'nankai', lat: 39.1042, lng: 117.1685, zoom: 15, district: '南开区' },
  { name: '天津 · 滨海新区', pinyin: 'binhai', lat: 39.0315, lng: 117.6542, zoom: 14, district: '滨海新区' },

  // 全国直辖市与主要城市
  { name: '北京', pinyin: 'beijing', lat: 39.9042, lng: 116.4074, zoom: 14, district: '东城区 / 西城区' },
  { name: '上海', pinyin: 'shanghai', lat: 31.2304, lng: 121.4737, zoom: 14, district: '黄浦区' },
  { name: '广州', pinyin: 'guangzhou', lat: 23.1291, lng: 113.2644, zoom: 14, district: '越秀区' },
  { name: '深圳', pinyin: 'shenzhen', lat: 22.5431, lng: 114.0579, zoom: 14, district: '福田区' },
  { name: '成都', pinyin: 'chengdu', lat: 30.5728, lng: 104.0668, zoom: 14, district: '锦江区' },
  { name: '杭州', pinyin: 'hangzhou', lat: 30.2741, lng: 120.1551, zoom: 14, district: '西湖区' },
  { name: '南京', pinyin: 'nanjing', lat: 32.0603, lng: 118.7969, zoom: 14, district: '玄武区' },
  { name: '武汉', pinyin: 'wuhan', lat: 30.5928, lng: 114.3055, zoom: 14, district: '江汉区' },
  { name: '重庆', pinyin: 'chongqing', lat: 29.5630, lng: 106.5516, zoom: 14, district: '渝中区' },
  { name: '西安', pinyin: 'xian', lat: 34.3416, lng: 108.9398, zoom: 14, district: '碑林区' },
  { name: '苏州', pinyin: 'suzhou', lat: 31.2990, lng: 120.5853, zoom: 14, district: '姑苏区' },
  { name: '青岛', pinyin: 'qingdao', lat: 36.0671, lng: 120.3826, zoom: 14, district: '市南区' },
  { name: '大连', pinyin: 'dalian', lat: 38.9140, lng: 121.6147, zoom: 14, district: '中山区' },
  { name: '厦门', pinyin: 'xiamen', lat: 24.4798, lng: 118.0894, zoom: 14, district: '思明区' },
];

export interface SearchResultItem {
  id: string;
  name: string;
  detail: string;
  lat: number;
  lng: number;
  zoom: number;
}

// 搜索本地预置词库
export function searchPresetCities(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return POPULAR_PRESET_CITIES.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.pinyin.toLowerCase().includes(q) ||
      (item.district && item.district.toLowerCase().includes(q))
    );
  }).map((item, idx) => ({
    id: `preset-${idx}-${item.name}`,
    name: item.name,
    detail: item.district ? `${item.district} · 点击直达` : '热门城市 · 点击直达',
    lat: item.lat,
    lng: item.lng,
    zoom: item.zoom,
  }));
}

// 在线开放搜索（如果用户搜索了更小众的具体街道、学校或地名）
export async function searchOnlinePlaces(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&countrycodes=cn&limit=6&accept-language=zh-CN`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map((item: any, idx: number) => ({
        id: `online-${idx}-${item.place_id}`,
        name: item.name || item.display_name.split(',')[0] || q,
        detail: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        zoom: 15,
      }));
    }
    return [];
  } catch (err) {
    console.warn('在线地理编码搜索请求略过', err);
    return [];
  }
}
