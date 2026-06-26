import type { Exercise } from './types';

// 合并后的动作数据库：胸背合并、肩臂合并
export const EXERCISES: Exercise[] = [
  // ── Chest & Back ──────────────────────────────────────────────────────────
  { id: 'bench-press',           name: 'Bench Press (平板卧推)',               category: 'chest' },
  { id: 'push-up',               name: 'Push-Up (俯卧撑)',                     category: 'chest' },
  { id: 'dumbbell-fly',          name: 'Dumbbell Fly (哑铃飞鸟)',              category: 'chest' },
  { id: 'dumbbell-squeeze-press',name: 'Dumbbell Squeeze Press (哑铃夹胸)',    category: 'chest' },
  { id: 'pull-up',               name: 'Pull-Up (引体向上)',                   category: 'chest' },
  { id: 'barbell-row',           name: 'Barbell Row (杠铃划船)',               category: 'chest' },
  { id: 'dumbbell-row',          name: 'Single-Arm Dumbbell Row (单臂哑铃划船)',category: 'chest' },
  { id: 'reverse-grip-row',      name: 'Reverse Grip Barbell Row (反手杠铃划船)',category: 'chest' },

  // ── Legs ──────────────────────────────────────────────────────────────────
  { id: 'rdl',                   name: 'Romanian Deadlift (罗马尼亚硬拉)',      category: 'legs' },
  { id: 'hip-thrust',            name: 'Hip Thrust (臀推)',                    category: 'legs' },
  { id: 'tbar-squat',            name: 'T-Bar Squat (T杠深蹲)',               category: 'legs' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat (保加利亚单腿蹲)', category: 'legs' },
  { id: 'donkey-kick',           name: 'Donkey Kick (后踢腿)',                 category: 'legs' },

  // ── Shoulders & Arms ──────────────────────────────────────────────────────
  { id: 'dumbbell-shoulder-press',name: 'Dumbbell Shoulder Press (哑铃推举)',  category: 'shoulders' },
  { id: 'lateral-raise',          name: 'Lateral Raise (侧平举)',              category: 'shoulders' },
  { id: 'front-raise',            name: 'Front Raise (前平举)',                category: 'shoulders' },
  { id: 'barbell-tricep-ext',     name: 'Barbell Tricep Extension (杠铃臂屈伸)',category: 'shoulders' },

  // ── Core ──────────────────────────────────────────────────────────────────
  { id: 'plank',                 name: 'Plank (平板支撑)',                     category: 'core' },
  { id: 'crunch',                name: 'Crunch (卷腹)',                        category: 'core' },
  { id: 'leg-raise',             name: 'Hanging Leg Raise (悬挂举腿)',         category: 'core' },

  // ── Cardio ────────────────────────────────────────────────────────────────
  { id: 'hiit',                  name: 'HIIT (高强度间歇)',                    category: 'cardio' },
  { id: 'muay-thai',             name: 'Muay Thai (泰拳)',                     category: 'cardio' },
];

// 仅保留实际使用的类别（胸背合并、肩臂合并）
export const CATEGORY_LABELS: Record<string, string> = {
  chest:     'Chest & Back',
  legs:      'Legs',
  shoulders: 'Shoulders & Arms',
  core:      'Core',
  cardio:    'Cardio',
};
