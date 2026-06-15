export const SELECT_QUESTION_TABS = [
  { id: 'self', label: '自编' },
  { id: 'shared', label: '共享' },
  { id: 'textbook', label: '教材' },
  { id: 'bank', label: '题目' },
];

export const SELECT_QUESTION_ENTRY_TABS = {
  自编: 'self',
  共享: 'shared',
  教材: 'textbook',
  题库: 'bank',
};

export const selfBooklets = [
  { id: 'ch1', label: '第一章测试题' },
  { id: 'ch2', label: '第二章练习题' },
  { id: 'mid', label: '期中复习卷' },
];

export const sharedBooklets = [
  { id: 'share_photo', label: '王老师分享-光合作用' },
  { id: 'share_structure', label: '张老师分享-细胞结构' },
];

export const selfQuestions = [
  {
    id: 's1',
    index: 1,
    type: '单选题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '下列关于细胞的说法正确的是（ ）',
  },
  {
    id: 's2',
    index: 2,
    type: '多选题',
    difficulty: '中等',
    difficultyClass: 'medium',
    stem: '植物细胞和动物细胞都具有的结构是（ ）（多选）',
  },
  {
    id: 's3',
    index: 3,
    type: '判断题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '细胞是生物体结构和功能的基本单位。（ ）',
  },
  {
    id: 's4',
    index: 4,
    type: '数字题',
    difficulty: '中等',
    difficultyClass: 'medium',
    stem: '人体内含量最多的物质是水，约占体重的___%。',
  },
  {
    id: 's5',
    index: 5,
    type: '主观题',
    difficulty: '困难',
    difficultyClass: 'hard',
    stem: '请简述细胞分裂的过程及其意义。',
  },
  {
    id: 's6',
    index: 6,
    type: '题组题',
    difficulty: '困难',
    difficultyClass: 'hard',
    stem: '【完形填空】共16小题',
    subText: [
      'A high school history teacher once told us, "If you make one close friend in school, you will be most fortunate. A true friend is someone who stays with you for life." (1)___ teaches that...',
    ],
  },
];

export const sharedQuestions = [
  {
    id: 'sh1',
    index: 1,
    type: '单选题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '绿色植物进行光合作用的主要器官是（ ）',
  },
  {
    id: 'sh2',
    index: 2,
    type: '判断题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '叶绿体是光合作用的场所。（ ）',
  },
  {
    id: 'sh3',
    index: 3,
    type: '主观题',
    difficulty: '困难',
    difficultyClass: 'hard',
    stem: '请说明光合作用对生物圈的重要意义。',
  },
];

export const textbookQuestions = [
  {
    id: 'tb1',
    index: 1,
    type: '单选题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '细胞壁的主要成分是（ ）',
  },
  {
    id: 'tb2',
    index: 2,
    type: '多选题',
    difficulty: '中等',
    difficultyClass: 'medium',
    stem: '细胞质中含有（ ）（多选）',
  },
  {
    id: 'tb3',
    index: 1,
    type: '判断题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '细胞中的能量转换器包括叶绿体和线粒体。（ ）',
  },
  {
    id: 'tb4',
    index: 2,
    type: '主观题',
    difficulty: '困难',
    difficultyClass: 'hard',
    stem: '请解释细胞呼吸的过程。',
  },
];

export const bankQuestions = [
  {
    id: 'bk1',
    index: 1,
    type: '单选题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '植物细胞特有的结构是（ ）',
  },
  {
    id: 'bk2',
    index: 2,
    type: '判断题',
    difficulty: '简单',
    difficultyClass: 'easy',
    stem: '细胞核内含有遗传物质。（ ）',
  },
  {
    id: 'bk3',
    index: 3,
    type: '单选题',
    difficulty: '中等',
    difficultyClass: 'medium',
    stem: '(2022·方城县一模) 下列运算正确的是（ ）\n A. a-2a=a \n B. (-a³b)²=a⁶b² \n C. (a+b)²=a²+b² \n D. √2 × √6 = √3',
  },
  {
    id: 'bk4',
    index: 4,
    type: '题组题',
    difficulty: '困难',
    difficultyClass: 'hard',
    stem: '【完形填空】共16小题',
    subText: [
      'A high school history teacher once told us, "If you make one close friend in school, you will be most fortunate. A true friend is someone who stays with you for life." (1)___ teaches that he was right.',
    ],
  },
];

export const questionsByTab = {
  self: selfQuestions,
  shared: sharedQuestions,
  textbook: textbookQuestions,
  bank: bankQuestions,
};

export const selectQuestionTreeProps = {
  label: 'label',
  children: 'children',
};

export const textbookChapterTreeData = [
  {
    id: 'tb-unit1',
    label: '第一章 细胞的生活',
    children: [
      { id: 'tb-1-1', label: '1.1 细胞的结构' },
      { id: 'tb-1-2', label: '1.2 细胞的生活需要物质和能量' },
    ],
  },
  {
    id: 'tb-unit2',
    label: '第二章 生物体的结构层次',
    children: [
      { id: 'tb-2-1', label: '2.1 细胞的分裂' },
      { id: 'tb-2-2', label: '2.2 动物体的结构层次' },
    ],
  },
];

export const bankChapterTreeData = [
  {
    id: 'bk-cell',
    label: '细胞',
    children: [
      { id: 'bk-cell-structure', label: '细胞的结构' },
      { id: 'bk-cell-life', label: '细胞的生活' },
    ],
  },
  {
    id: 'bk-env',
    label: '生物与环境',
    children: [
      { id: 'bk-env-1', label: '生物与环境的关系' },
      { id: 'bk-env-2', label: '生态系统' },
    ],
  },
];

export const bankKnowledgeTreeData = [
  {
    id: 'kn-bio',
    label: '生物学基础',
    children: [
      { id: 'kn-cell', label: '细胞结构与功能' },
      { id: 'kn-metabolism', label: '物质与能量代谢' },
    ],
  },
  {
    id: 'kn-eco',
    label: '生态与进化',
    children: [
      { id: 'kn-ecosystem', label: '生态系统' },
      { id: 'kn-evolution', label: '生物进化' },
    ],
  },
  {
    id: 'kn-exp',
    label: '实验与探究',
    children: [
      { id: 'kn-microscope', label: '显微镜使用' },
      { id: 'kn-observation', label: '观察与记录' },
    ],
  },
];
