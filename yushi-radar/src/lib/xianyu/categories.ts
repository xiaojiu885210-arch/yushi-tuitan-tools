export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  /** Goofish cateId when known; empty means search by name. */
  goofishId: string;
  hint: string;
};

export const CATEGORIES: Category[] = [
  { id: "digital", name: "闲置数码", parentId: null, goofishId: "", hint: "手机电脑影音" },
  { id: "phone", name: "手机", parentId: "digital", goofishId: "126854557", hint: "二手手机" },
  { id: "tablet", name: "平板", parentId: "digital", goofishId: "", hint: "iPad 安卓平板" },
  { id: "computer", name: "电脑", parentId: "digital", goofishId: "", hint: "笔记本台式机" },
  { id: "audio", name: "影音配件", parentId: "digital", goofishId: "", hint: "耳机音响相机" },

  { id: "appliance", name: "家用电器", parentId: null, goofishId: "", hint: "大家电小家电" },
  { id: "kitchen", name: "厨房电器", parentId: "appliance", goofishId: "", hint: "电饭煲空气炸锅" },
  { id: "life-app", name: "生活电器", parentId: "appliance", goofishId: "", hint: "扫地机风扇" },

  { id: "fashion", name: "服装鞋包", parentId: null, goofishId: "", hint: "穿戴配饰" },
  { id: "women", name: "女装", parentId: "fashion", goofishId: "", hint: "连衣裙外套" },
  { id: "men", name: "男装", parentId: "fashion", goofishId: "", hint: "T恤卫衣" },
  { id: "shoes", name: "鞋靴", parentId: "fashion", goofishId: "", hint: "运动鞋皮鞋" },
  { id: "bag", name: "箱包", parentId: "fashion", goofishId: "", hint: "双肩包皮包" },

  { id: "beauty", name: "美妆个护", parentId: null, goofishId: "", hint: "彩妆护肤" },
  { id: "skincare", name: "护肤", parentId: "beauty", goofishId: "", hint: "精华面霜" },
  { id: "makeup", name: "彩妆", parentId: "beauty", goofishId: "", hint: "口红粉底" },

  { id: "home", name: "家具家居", parentId: null, goofishId: "", hint: "桌椅收纳" },
  { id: "furniture", name: "家具", parentId: "home", goofishId: "", hint: "床沙发书桌" },
  { id: "decor", name: "家居日用", parentId: "home", goofishId: "", hint: "灯具收纳" },

  { id: "sport", name: "运动户外", parentId: null, goofishId: "", hint: "健身骑行" },
  { id: "fitness", name: "健身器材", parentId: "sport", goofishId: "", hint: "哑铃瑜伽" },
  { id: "outdoor", name: "户外装备", parentId: "sport", goofishId: "", hint: "帐篷登山" },

  { id: "book", name: "图书文娱", parentId: null, goofishId: "", hint: "教材乐器" },
  { id: "textbook", name: "教材考试", parentId: "book", goofishId: "", hint: "考研公考" },
  { id: "hobby", name: "文玩乐器", parentId: "book", goofishId: "", hint: "吉他手办" },

  { id: "baby", name: "母婴玩具", parentId: null, goofishId: "", hint: "童装玩具" },
  { id: "toy", name: "玩具潮玩", parentId: "baby", goofishId: "", hint: "积木盲盒" },

  { id: "auto", name: "汽车用品", parentId: null, goofishId: "", hint: "车载配件" },
  { id: "pet", name: "宠物用品", parentId: null, goofishId: "", hint: "猫狗粮食" },
  { id: "food", name: "食品保健", parentId: null, goofishId: "", hint: "零食保健品" },

  { id: "game", name: "游戏电玩", parentId: null, goofishId: "", hint: "主机掌机" },
  { id: "console", name: "游戏主机", parentId: "game", goofishId: "", hint: "Switch PS5" },
  { id: "game-acc", name: "游戏账号", parentId: "game", goofishId: "", hint: "皮肤成品号" },

  { id: "virtual", name: "虚拟商品", parentId: null, goofishId: "", hint: "软件卡券" },
  { id: "software", name: "软件工具", parentId: "virtual", goofishId: "", hint: "采集脚本自动化" },
  { id: "source", name: "源码模板", parentId: "virtual", goofishId: "", hint: "网站小程序源码" },
  { id: "card", name: "卡券会员", parentId: "virtual", goofishId: "", hint: "会员兑换码" },
  { id: "service", name: "技能服务", parentId: "virtual", goofishId: "", hint: "代做设计安装" },
];

export const ROOT_CATEGORIES = CATEGORIES.filter((c) => !c.parentId);

export function childrenOf(id: string): Category[] {
  return CATEGORIES.filter((c) => c.parentId === id);
}

export function findCategory(id: string | null | undefined): Category | undefined {
  if (!id) return undefined;
  return CATEGORIES.find((c) => c.id === id);
}

export function categoryPath(id: string): Category[] {
  const path: Category[] = [];
  let cur = findCategory(id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? findCategory(cur.parentId) : undefined;
  }
  return path;
}

export const KEYWORD_PRESETS: { label: string; keyword: string; categoryId: string }[] = [
  { label: "闲鱼采集", keyword: "闲鱼采集", categoryId: "software" },
  { label: "自动发货", keyword: "自动发货", categoryId: "software" },
  { label: "卡密系统", keyword: "卡密 发卡", categoryId: "software" },
  { label: "铺货搬家", keyword: "闲鱼铺货", categoryId: "software" },
  { label: "去水印", keyword: "去水印 工具", categoryId: "software" },
  { label: "Excel 插件", keyword: "Excel 插件", categoryId: "software" },
  { label: "油猴脚本", keyword: "油猴脚本", categoryId: "software" },
  { label: "小程序源码", keyword: "小程序源码", categoryId: "source" },
  { label: "二手 iPhone", keyword: "iPhone", categoryId: "phone" },
  { label: "Switch", keyword: "Switch", categoryId: "console" },
];
