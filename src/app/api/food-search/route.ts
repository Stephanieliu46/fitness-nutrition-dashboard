import { NextRequest, NextResponse } from 'next/server';

interface FoodItem {
  name: string;
  keywords: string[];
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

// Local database of common foods — searched first before hitting the external API
const LOCAL_FOODS: FoodItem[] = [
  // ── Milk / 牛奶 ──────────────────────────────────────────────────────────────
  { name: '脱脂牛奶 (Skim Milk)',        keywords: ['脱脂牛奶','skim milk','脱脂','skim','fat free milk','无脂牛奶','milk'], kcalPer100g: 34,  proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 0.1 },
  { name: '半脱脂牛奶 (Semi-Skimmed)',   keywords: ['半脱脂牛奶','semi skimmed','半脱脂','semi-skim','低脂牛奶','low fat milk','1% milk','2% milk','牛奶','milk'], kcalPer100g: 47,  proteinPer100g: 3.5, carbsPer100g: 4.9, fatPer100g: 1.5 },
  { name: '全脂牛奶 (Whole Milk)',       keywords: ['全脂牛奶','whole milk','全脂','full fat milk','牛奶','milk'],           kcalPer100g: 61,  proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.2 },
  { name: '豆浆 (Soy Milk)',            keywords: ['豆浆','soy milk','soymilk','豆奶','plant milk'],                        kcalPer100g: 33,  proteinPer100g: 3.3, carbsPer100g: 2.1, fatPer100g: 1.9 },
  { name: '燕麦奶 (Oat Milk)',          keywords: ['燕麦奶','oat milk','oatmilk','燕麦'],                                  kcalPer100g: 46,  proteinPer100g: 1.0, carbsPer100g: 8.3, fatPer100g: 1.5 },
  { name: '杏仁奶 (Almond Milk)',       keywords: ['杏仁奶','almond milk','almondmilk'],                                   kcalPer100g: 17,  proteinPer100g: 0.6, carbsPer100g: 0.7, fatPer100g: 1.4 },

  // ── Yogurt / 酸奶 ────────────────────────────────────────────────────────────
  { name: '希腊酸奶 (Greek Yogurt)',     keywords: ['希腊酸奶','greek yogurt','greek yoghurt','希腊','酸奶','yogurt'],        kcalPer100g: 97,  proteinPer100g: 9.0, carbsPer100g: 3.6, fatPer100g: 5.0 },
  { name: '低脂酸奶 (Low-fat Yogurt)',   keywords: ['低脂酸奶','low fat yogurt','plain yogurt','原味酸奶','酸奶','yogurt'],   kcalPer100g: 59,  proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 1.6 },

  // ── Eggs / 鸡蛋 ──────────────────────────────────────────────────────────────
  { name: '全蛋 (Whole Egg)',           keywords: ['鸡蛋','全蛋','egg','whole egg','eggs'],                                  kcalPer100g: 155, proteinPer100g: 13.0, carbsPer100g: 1.1, fatPer100g: 11.0 },
  { name: '蛋清 (Egg White)',           keywords: ['蛋清','蛋白','egg white','egg whites','白蛋白'],                         kcalPer100g: 52,  proteinPer100g: 11.0, carbsPer100g: 0.7, fatPer100g: 0.2 },
  { name: '蛋黄 (Egg Yolk)',            keywords: ['蛋黄','egg yolk','yolk'],                                               kcalPer100g: 322, proteinPer100g: 16.0, carbsPer100g: 3.6, fatPer100g: 27.0 },

  // ── Poultry / 禽肉 ───────────────────────────────────────────────────────────
  { name: '鸡胸肉 (Chicken Breast)',    keywords: ['鸡胸肉','鸡胸','chicken breast','chicken','禽肉'],                       kcalPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0.0, fatPer100g: 3.6 },
  { name: '鸡腿肉 (Chicken Thigh)',     keywords: ['鸡腿','鸡腿肉','chicken thigh','chicken leg','chicken'],                kcalPer100g: 209, proteinPer100g: 26.0, carbsPer100g: 0.0, fatPer100g: 11.0 },

  // ── Meat / 肉类 ──────────────────────────────────────────────────────────────
  { name: '瘦牛肉 (Lean Beef)',         keywords: ['瘦牛肉','牛肉','beef','lean beef','steak','牛排'],                        kcalPer100g: 215, proteinPer100g: 26.0, carbsPer100g: 0.0, fatPer100g: 12.0 },
  { name: '瘦猪肉 (Lean Pork)',         keywords: ['瘦猪肉','猪肉','pork','lean pork'],                                     kcalPer100g: 143, proteinPer100g: 21.0, carbsPer100g: 0.0, fatPer100g: 6.0 },
  { name: '三文鱼 (Salmon)',            keywords: ['三文鱼','鲑鱼','salmon','atlantic salmon'],                              kcalPer100g: 208, proteinPer100g: 20.0, carbsPer100g: 0.0, fatPer100g: 13.0 },
  { name: '金枪鱼 (Tuna)',              keywords: ['金枪鱼','吞拿鱼','tuna','canned tuna'],                                  kcalPer100g: 116, proteinPer100g: 26.0, carbsPer100g: 0.0, fatPer100g: 1.0 },

  // ── Coffee / 咖啡 ────────────────────────────────────────────────────────────
  { name: '黑咖啡 (Black Coffee)',      keywords: ['黑咖啡','black coffee','filter coffee','drip coffee','咖啡','coffee'],   kcalPer100g: 1,   proteinPer100g: 0.1, carbsPer100g: 0.0, fatPer100g: 0.0 },
  { name: '浓缩咖啡 (Espresso)',        keywords: ['浓缩咖啡','espresso','意式浓缩','咖啡','coffee'],                         kcalPer100g: 9,   proteinPer100g: 0.6, carbsPer100g: 1.7, fatPer100g: 0.2 },
  { name: '拿铁 (Latte)',               keywords: ['拿铁','latte','café latte','咖啡','coffee'],                             kcalPer100g: 62,  proteinPer100g: 3.6, carbsPer100g: 6.2, fatPer100g: 2.5 },
  { name: '美式咖啡 (Americano)',       keywords: ['美式咖啡','americano','美式','咖啡','coffee'],                            kcalPer100g: 5,   proteinPer100g: 0.1, carbsPer100g: 0.7, fatPer100g: 0.0 },
  { name: '卡布奇诺 (Cappuccino)',      keywords: ['卡布奇诺','cappuccino','咖啡','coffee'],                                  kcalPer100g: 74,  proteinPer100g: 4.0, carbsPer100g: 5.4, fatPer100g: 3.9 },
  { name: '摩卡 (Mocha)',               keywords: ['摩卡','mocha','咖啡','coffee'],                                          kcalPer100g: 93,  proteinPer100g: 3.0, carbsPer100g: 13.0, fatPer100g: 3.2 },

  // ── Grains / 主食 ────────────────────────────────────────────────────────────
  { name: '白米饭 (Cooked White Rice)', keywords: ['白米饭','米饭','白饭','white rice','cooked rice','rice','大米'],          kcalPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.0, fatPer100g: 0.3 },
  { name: '糙米饭 (Brown Rice)',        keywords: ['糙米饭','糙米','brown rice','全谷米'],                                    kcalPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24.0, fatPer100g: 0.9 },
  { name: '燕麦片 (Oats)',              keywords: ['燕麦片','燕麦','oatmeal','oats','porridge','rolled oats'],               kcalPer100g: 389, proteinPer100g: 17.0, carbsPer100g: 66.0, fatPer100g: 7.0 },
  { name: '全麦面包 (Whole Wheat Bread)', keywords: ['全麦面包','全麦','whole wheat bread','wholemeal bread','bread'],       kcalPer100g: 247, proteinPer100g: 13.0, carbsPer100g: 41.0, fatPer100g: 4.0 },
  { name: '白面包 (White Bread)',       keywords: ['白面包','白吐司','white bread','bread','吐司'],                           kcalPer100g: 265, proteinPer100g: 9.0,  carbsPer100g: 49.0, fatPer100g: 3.2 },
  { name: '面条 (Noodles)',             keywords: ['面条','noodles','pasta','意面','意大利面'],                               kcalPer100g: 138, proteinPer100g: 5.0,  carbsPer100g: 25.0, fatPer100g: 2.0 },

  // ── Protein / 蛋白类 ─────────────────────────────────────────────────────────
  { name: '乳清蛋白粉 (Whey Protein)',  keywords: ['乳清蛋白','蛋白粉','whey protein','whey','protein powder','乳清'],       kcalPer100g: 400, proteinPer100g: 80.0, carbsPer100g: 5.0, fatPer100g: 5.0 },
  { name: '豆腐 (Tofu)',               keywords: ['豆腐','tofu','bean curd','嫩豆腐','老豆腐'],                              kcalPer100g: 76,  proteinPer100g: 8.0,  carbsPer100g: 1.9, fatPer100g: 4.8 },
  { name: '花生酱 (Peanut Butter)',    keywords: ['花生酱','peanut butter','花生','peanut'],                                 kcalPer100g: 588, proteinPer100g: 25.0, carbsPer100g: 20.0, fatPer100g: 50.0 },

  // ── Vegetables / 蔬菜 ────────────────────────────────────────────────────────
  { name: '西兰花 (Broccoli)',          keywords: ['西兰花','花椰菜','broccoli'],                                             kcalPer100g: 34,  proteinPer100g: 2.8, carbsPer100g: 7.0,  fatPer100g: 0.4 },
  { name: '菠菜 (Spinach)',             keywords: ['菠菜','spinach'],                                                        kcalPer100g: 23,  proteinPer100g: 2.9, carbsPer100g: 3.6,  fatPer100g: 0.4 },
  { name: '番茄 (Tomato)',              keywords: ['番茄','西红柿','tomato','tomatoes'],                                      kcalPer100g: 18,  proteinPer100g: 0.9, carbsPer100g: 3.9,  fatPer100g: 0.2 },
  { name: '黄瓜 (Cucumber)',            keywords: ['黄瓜','cucumber'],                                                       kcalPer100g: 15,  proteinPer100g: 0.7, carbsPer100g: 3.6,  fatPer100g: 0.1 },
  { name: '胡萝卜 (Carrot)',            keywords: ['胡萝卜','carrot','carrots'],                                              kcalPer100g: 41,  proteinPer100g: 0.9, carbsPer100g: 10.0, fatPer100g: 0.2 },
  { name: '牛油果 (Avocado)',           keywords: ['牛油果','avocado','鳄梨'],                                               kcalPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 9.0,  fatPer100g: 15.0 },

  // ── Fruit / 水果 ─────────────────────────────────────────────────────────────
  { name: '香蕉 (Banana)',              keywords: ['香蕉','banana','bananas'],                                               kcalPer100g: 89,  proteinPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3 },
  { name: '苹果 (Apple)',               keywords: ['苹果','apple','apples'],                                                 kcalPer100g: 52,  proteinPer100g: 0.3, carbsPer100g: 14.0, fatPer100g: 0.2 },
  { name: '草莓 (Strawberry)',          keywords: ['草莓','strawberry','strawberries'],                                      kcalPer100g: 32,  proteinPer100g: 0.7, carbsPer100g: 7.7,  fatPer100g: 0.3 },
  { name: '橙子 (Orange)',              keywords: ['橙子','橙','orange','oranges'],                                          kcalPer100g: 47,  proteinPer100g: 0.9, carbsPer100g: 12.0, fatPer100g: 0.1 },
  { name: '蓝莓 (Blueberry)',           keywords: ['蓝莓','blueberry','blueberries'],                                       kcalPer100g: 57,  proteinPer100g: 0.7, carbsPer100g: 14.0, fatPer100g: 0.3 },
  { name: '芒果 (Mango)',               keywords: ['芒果','mango','mangoes'],                                               kcalPer100g: 60,  proteinPer100g: 0.8, carbsPer100g: 15.0, fatPer100g: 0.4 },
];

function searchLocal(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = LOCAL_FOODS.map(food => {
    const nameLower = food.name.toLowerCase();
    let score = 0;
    if (nameLower.startsWith(q)) score = 100;
    else if (nameLower.includes(q)) score = 80;
    else if (food.keywords.some(k => k === q)) score = 70;
    else if (food.keywords.some(k => k.includes(q) || q.includes(k))) score = 50;
    return { food, score };
  })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.food);

  return scored;
}

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  nutriments?: OFFNutriments;
}

async function searchOFF(query: string): Promise<FoodItem[]> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=10` +
    `&fields=product_name,nutriments`;

  const res = await fetch(url, { headers: { 'User-Agent': 'FitTrackApp/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();

  return ((data.products ?? []) as OFFProduct[])
    .filter(p => {
      const n = p.nutriments;
      return (
        p.product_name?.trim() &&
        (n?.['energy-kcal_100g'] ?? 0) > 0 &&
        (n?.proteins_100g ?? 0) >= 0 &&
        (n?.carbohydrates_100g ?? 0) >= 0
      );
    })
    .slice(0, 6)
    .map(p => ({
      name: p.product_name!.trim(),
      keywords: [],
      kcalPer100g: Math.round(p.nutriments!['energy-kcal_100g']!),
      proteinPer100g: +(p.nutriments!.proteins_100g ?? 0).toFixed(1),
      carbsPer100g: +(p.nutriments!.carbohydrates_100g ?? 0).toFixed(1),
      fatPer100g: +(p.nutriments!.fat_100g ?? 0).toFixed(1),
    }));
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') ?? '';
  if (!query.trim()) return NextResponse.json({ results: [] });

  try {
    const localResults = searchLocal(query);

    // If we have enough local results, return them directly (fast, no external call)
    if (localResults.length >= 4) {
      return NextResponse.json({
        results: localResults.slice(0, 6).map(({ keywords: _k, ...r }) => r),
      });
    }

    // Otherwise supplement with Open Food Facts
    const offResults = await searchOFF(query);
    const combined = [...localResults];
    for (const off of offResults) {
      if (combined.length >= 6) break;
      const duplicate = combined.some(
        c => c.name.toLowerCase().includes(off.name.toLowerCase().slice(0, 8))
      );
      if (!duplicate) combined.push(off);
    }

    return NextResponse.json({
      results: combined.slice(0, 6).map(({ keywords: _k, ...r }) => r),
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
