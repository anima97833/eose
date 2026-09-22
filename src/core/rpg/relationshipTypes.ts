import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type RelationshipCategory = 'family' | 'partner' | 'friend' | 'mentor' | 'pet';

export interface RelationshipNode extends SimulationNodeDatum {
  id: string;
  name: string;        // 姓名/昵称 (<= 5 字)
  relation: string;    // 称谓 (如: 父亲, 挚友, 伴侣, 爱宠, <= 5 字)
  category: RelationshipCategory;
  avatarEmoji?: string;
  avatarUrl?: string | null;
  desc?: string;       // 寄语随笔
  isCenter?: boolean;  // 是否为中心“我”
  color?: string;
}

export interface RelationshipLink extends SimulationLinkDatum<RelationshipNode> {
  id: string;
  source: string | RelationshipNode;
  target: string | RelationshipNode;
  label?: string;      // 关系标注 (<= 5 字)
}

export interface RelationshipData {
  nodes: RelationshipNode[];
  links: RelationshipLink[];
}

export const DEFAULT_RELATIONSHIP_DATA: RelationshipData = {
  nodes: [
    {
      id: 'node_self',
      name: '我自己',
      relation: '主角',
      category: 'partner',
      avatarEmoji: '⭐',
      isCenter: true,
      desc: '探索世界的人生主角',
    },
    {
      id: 'node_father',
      name: '老爸',
      relation: '父亲',
      category: 'family',
      avatarEmoji: '🛡️',
      desc: '沉稳厚重的避风港湾',
    },
    {
      id: 'node_mother',
      name: '老妈',
      relation: '母亲',
      category: 'family',
      avatarEmoji: '🌸',
      desc: '温暖无微不至的关怀',
    },
    {
      id: 'node_partner',
      name: '同行者',
      relation: '挚爱',
      category: 'partner',
      avatarEmoji: '💖',
      desc: '共同奔赴未来的伴侣',
    },
    {
      id: 'node_friend',
      name: '发小',
      relation: '挚友',
      category: 'friend',
      avatarEmoji: '🍻',
      desc: '无话不谈的坚实后盾',
    },
    {
      id: 'node_mentor',
      name: '引路人',
      relation: '导师',
      category: 'mentor',
      avatarEmoji: '📜',
      desc: '指点迷津的智慧之光',
    },
    {
      id: 'node_pet',
      name: '咪咪',
      relation: '爱猫',
      category: 'pet',
      avatarEmoji: '🐾',
      desc: '日常治愈心灵的毛孩子',
    },
  ],
  links: [
    { id: 'link_self_father', source: 'node_self', target: 'node_father', label: '亲情' },
    { id: 'link_self_mother', source: 'node_self', target: 'node_mother', label: '亲情' },
    { id: 'link_self_partner', source: 'node_self', target: 'node_partner', label: '羁绊' },
    { id: 'link_self_friend', source: 'node_self', target: 'node_friend', label: '死党' },
    { id: 'link_self_mentor', source: 'node_self', target: 'node_mentor', label: '师徒' },
    { id: 'link_self_pet', source: 'node_self', target: 'node_pet', label: '守护' },
  ],
};
