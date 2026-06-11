<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="title">选题提问</h1>
        <span class="sync-time">数据最后同步时间: 2026/05/06 20:00</span>
      </div>
    </div>

    <!-- 2. 主体三栏内容 -->
    <div class="page-content">
      <!-- ==================== 左边栏：随 Tab 条件渲染 ==================== -->
      <div class="left-sidebar-panel">
        <!-- Tab 1: 自编 左栏 -->
        <template v-if="currentTab === 'self'">
          <div class="sidebar-title">题集列表</div>
          <div class="nav-list">
            <div
              v-for="item in selfBooklets"
              :key="item.id"
              class="nav-item"
              :class="{ active: activeSelfBooklet === item.id }"
              @click="activeSelfBooklet = item.id"
            >
              {{ item.label }}
            </div>
          </div>
        </template>

        <!-- Tab 2: 共享 左栏 -->
        <template v-else-if="currentTab === 'shared'">
          <div class="sidebar-title">题集列表</div>
          <div class="nav-list">
            <div
              v-for="item in sharedBooklets"
              :key="item.id"
              class="nav-item"
              :class="{ active: activeSharedBooklet === item.id }"
              @click="activeSharedBooklet = item.id"
            >
              {{ item.label }}
            </div>
          </div>
        </template>

        <!-- Tab 3: 教材 左栏 -->
        <template v-else-if="currentTab === 'textbook'">
          <div class="select-wrapper">
            <span class="filter-label">选教材</span>
            <el-select v-model="selectedTextbook" size="large">
              <el-option label="初二下册英语人教统编版" value="english8" />
            </el-select>
          </div>
          <!-- 目录树 -->
          <div class="tree-menu">
            <div class="tree-group">
              <div
                class="tree-item-level1"
                @click="isUnitExpanded.unit1 = !isUnitExpanded.unit1"
              >
                <span class="arrow" :class="{ expanded: isUnitExpanded.unit1 }"
                  >▼</span
                >
                第一章 细胞的生活
              </div>
              <div v-show="isUnitExpanded.unit1" class="tree-children">
                <div
                  class="tree-item-level2"
                  :class="{ active: activeTextbookNode === '1.1' }"
                  @click="activeTextbookNode = '1.1'"
                >
                  1.1 细胞的结构
                </div>
                <div
                  class="tree-item-level2"
                  :class="{ active: activeTextbookNode === '1.2' }"
                  @click="activeTextbookNode = '1.2'"
                >
                  1.2 细胞的生活需要物质和能量
                </div>
              </div>
            </div>
            <div
              class="tree-item-level1"
              @click="isUnitExpanded.unit2 = !isUnitExpanded.unit2"
            >
              <span class="arrow" :class="{ expanded: isUnitExpanded.unit2 }"
                >▶</span
              >
              第二章 生物体的结构层次
            </div>
          </div>
        </template>

        <!-- Tab 4: 题库 左栏 -->
        <template v-else-if="currentTab === 'bank'">
          <div class="tab-toggle-container">
            <button
              class="tab-sub-btn"
              :class="{ active: bankSubTab === 'chapter' }"
              @click="bankSubTab = 'chapter'"
            >
              章节选题
            </button>
            <button
              class="tab-sub-btn"
              :class="{ active: bankSubTab === 'knowledge' }"
              @click="bankSubTab = 'knowledge'"
            >
              知识点选题
            </button>
          </div>

          <div class="select-wrapper">
            <span class="filter-label">选教材</span>
            <el-select v-model="selectedBankBook" size="large">
              <el-option label="初二上册 · 人教部编版" value="biology8" />
            </el-select>
          </div>

          <div class="tree-menu">
            <div class="tree-group">
              <div
                class="tree-item-level1"
                @click="isBankExpanded.unit1 = !isBankExpanded.unit1"
              >
                <span class="arrow" :class="{ expanded: isBankExpanded.unit1 }"
                  >▼</span
                >
                细胞
              </div>
              <div v-show="isBankExpanded.unit1" class="tree-children">
                <div
                  class="tree-item-level2"
                  :class="{ active: activeBankNode === '1.1' }"
                  @click="activeBankNode = '1.1'"
                >
                  细胞的结构
                </div>
                <div
                  class="tree-item-level2"
                  :class="{ active: activeBankNode === '1.2' }"
                  @click="activeBankNode = '1.2'"
                >
                  细胞的生活
                </div>
              </div>
            </div>
            <div
              class="tree-item-level1"
              @click="isBankExpanded.unit2 = !isBankExpanded.unit2"
            >
              <span class="arrow" :class="{ expanded: isBankExpanded.unit2 }"
                >▶</span
              >
              生物与环境
            </div>
          </div>
        </template>
      </div>

      <!-- ==================== 中间大栏：题目筛选与动态卡片列表 ==================== -->
      <div class="center-content-panel">
        <!-- 筛选下拉菜单组 -->
        <div class="filter-header-row">
          <div class="filter-item">
            <span class="filter-text-label">题型</span>
            <el-select v-model="filterType" style="width: 110px">
              <el-option label="全部" value="all" />
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multi" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-text-label">难度</span>
            <el-select v-model="filterDifficulty" style="width: 110px">
              <el-option label="全部" value="all" />
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </div>
        </div>

        <!-- 题目渲染列表 -->
        <div class="questions-scroll-list">
          <div
            v-for="q in currentQuestions"
            :key="q.id"
            class="question-card"
            :class="{ checked: checkedQuestionIds.includes(q.id) }"
          >
            <!-- 头部元数据 -->
            <div class="card-meta-row">
              <span class="q-index">{{ q.index }}.</span>
              <span class="q-type-badge">{{ q.type }}</span>
              <span class="q-difficulty-badge" :class="q.difficultyClass">{{
                q.difficulty
              }}</span>

              <!-- 仿原图极简Checkbox样式 -->
              <div class="checkbox-wrapper" @click="toggleCheck(q.id)">
                <span
                  class="custom-checkbox"
                  :class="{ checked: checkedQuestionIds.includes(q.id) }"
                ></span>
              </div>
            </div>

            <!-- 题目正文 -->
            <div class="q-content-body">
              <p class="stem-text">{{ q.stem }}</p>
              <!-- 若有完形填空等复杂富文本展示 -->
              <div v-if="q.subText" class="sub-rich-text">
                <p v-for="(pText, pIdx) in q.subText" :key="pIdx">
                  {{ pText }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 右侧：主 Tab 切换栏 ==================== -->
      <div class="right-tab-panel">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-nav-item"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- 3. 底部固定控制栏 -->
    <div class="page-footer">
      <div class="footer-left">
        <button class="btn btn-outline" @click="handleSync">
          <span class="icon-sync">🔄</span> 同步
        </button>
      </div>
      <div class="footer-actions">
        <!-- 动态计算已勾选题数 -->
        <span class="selection-indicator">
          已选择
          <span class="highlight-count">{{ checkedQuestionIds.length }}</span>
          道题
        </span>
        <!-- “开始提问”按钮：仅当选择题数 > 0 时变为激活状态（绿色） -->
        <button
          class="btn btn-primary"
          :class="{ active: checkedQuestionIds.length > 0 }"
          :disabled="checkedQuestionIds.length === 0"
          @click="handleLaunchQuestions"
        >
          开始提问
        </button>
        <button class="btn btn-close-icon" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// 四大主 Tab 切换: 'self' | 'shared' | 'textbook' | 'bank'
const tabs = [
  { id: "self", label: "自编" },
  { id: "shared", label: "共享" },
  { id: "textbook", label: "教材" },
  { id: "bank", label: "题库" },
];
const currentTab = ref("self");

// 教材/题库下拉绑定
const selectedTextbook = ref("english8");
const selectedBankBook = ref("biology8");

// 中间筛选器
const filterType = ref("all");
const filterDifficulty = ref("all");

// 各选项卡下已勾选的题目 ID 数组
const checkedQuestionIds = ref([]);

// 监听 Tab 切换时清空或保持选择状态
watch(currentTab, () => {
  // 可按业务需求选择是否在切换 Tab 时重置勾选：checkedQuestionIds.value = []
});

// === Tab 1: 自编 模拟数据 ===
const selfBooklets = ref([
  { id: "ch1", label: "第一章测试题" },
  { id: "ch2", label: "第二章练习题" },
  { id: "mid", label: "期中复习卷" },
]);
const activeSelfBooklet = ref("ch1");

const selfQuestions = [
  {
    id: "s1",
    index: 1,
    type: "单选题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "下列关于细胞的说法正确的是（ ）",
  },
  {
    id: "s2",
    index: 2,
    type: "多选题",
    difficulty: "中等",
    difficultyClass: "medium",
    stem: "植物细胞和动物细胞都具有的结构是（ ）（多选）",
  },
  {
    id: "s3",
    index: 3,
    type: "判断题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "细胞是生物体结构和功能的基本单位。（ ）",
  },
  {
    id: "s4",
    index: 4,
    type: "数字题",
    difficulty: "中等",
    difficultyClass: "medium",
    stem: "人体内含量最多的物质是水，约占体重的___%。",
  },
  {
    id: "s5",
    index: 5,
    type: "主观题",
    difficulty: "困难",
    difficultyClass: "hard",
    stem: "请简述细胞分裂的过程及其意义。",
  },
  {
    id: "s6",
    index: 6,
    type: "题组题",
    difficulty: "困难",
    difficultyClass: "hard",
    stem: "【完形填空】共16小题",
    subText: [
      'A high school history teacher once told us, "If you make one close friend in school, you will be most fortunate. A true friend is someone who stays with you for life." (1)___ teaches that...',
    ],
  },
];

// === Tab 2: 共享 模拟数据 ===
const sharedBooklets = ref([
  { id: "share_photo", label: "王老师分享-光合作用" },
  { id: "share_structure", label: "张老师分享-细胞结构" },
]);
const activeSharedBooklet = ref("share_photo");

const sharedQuestions = [
  {
    id: "sh1",
    index: 1,
    type: "单选题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "绿色植物进行光合作用的主要器官是（ ）",
  },
  {
    id: "sh2",
    index: 2,
    type: "判断题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "叶绿体是光合作用的场所。（ ）",
  },
  {
    id: "sh3",
    index: 3,
    type: "主观题",
    difficulty: "困难",
    difficultyClass: "hard",
    stem: "请说明光合作用对生物圈的重要意义。",
  },
];

// === Tab 3: 教材 目录树与模拟数据 ===
const isUnitExpanded = ref({ unit1: true, unit2: false });
const activeTextbookNode = ref("1.1");

const textbookQuestions = [
  {
    id: "tb1",
    index: 1,
    type: "单选题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "细胞壁的主要成分是（ ）",
  },
  {
    id: "tb2",
    index: 2,
    type: "多选题",
    difficulty: "中等",
    difficultyClass: "medium",
    stem: "细胞质中含有（ ）（多选）",
  },
  {
    id: "tb3",
    index: 1,
    type: "判断题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "细胞中的能量转换器包括叶绿体和线粒体。（ ）",
  },
  {
    id: "tb4",
    index: 2,
    type: "主观题",
    difficulty: "困难",
    difficultyClass: "hard",
    stem: "请解释细胞呼吸的过程。",
  },
];

// === Tab 4: 题库 目录树与模拟数据 ===
const bankSubTab = ref("chapter"); // 'chapter' | 'knowledge'
const isBankExpanded = ref({ unit1: true, unit2: false });
const activeBankNode = ref("1.1");

const bankQuestions = [
  {
    id: "bk1",
    index: 1,
    type: "单选题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "植物细胞特有的结构是（ ）",
  },
  {
    id: "bk2",
    index: 2,
    type: "判断题",
    difficulty: "简单",
    difficultyClass: "easy",
    stem: "细胞核内含有遗传物质。（ ）",
  },
  {
    id: "bk3",
    index: 3,
    type: "单选题",
    difficulty: "中等",
    difficultyClass: "medium",
    stem: "(2022·方城县一模) 下列运算正确的是（ ）\n A. a-2a=a \n B. (-a³b)²=a⁶b² \n C. (a+b)²=a²+b² \n D. √2 × √6 = √3",
  },
  {
    id: "bk4",
    index: 4,
    type: "题组题",
    difficulty: "困难",
    difficultyClass: "hard",
    stem: "【完形填空】共16小题",
    subText: [
      'A high school history teacher once told us, "If you make one close friend in school, you will be most fortunate. A true friend is someone who stays with you for life." (1)___ teaches that he was right. Good friends are just not easily (2)___.',
      "It is possible that we simply do not give ourselves enough (3)___ friendship to develop...",
    ],
  },
];

// 计算属性：根据当前激活 Tab 动态输出题目数据
const currentQuestions = computed(() => {
  const map = {
    self: selfQuestions,
    shared: sharedQuestions,
    textbook: textbookQuestions,
    bank: bankQuestions,
  };
  return map[currentTab.value] || [];
});

// 自定义复选控制
const toggleCheck = (id) => {
  const idx = checkedQuestionIds.value.indexOf(id);
  if (idx > -1) {
    checkedQuestionIds.value.splice(idx, 1);
  } else {
    checkedQuestionIds.value.push(id);
  }
};

/**
 * 底部操作事件
 */
const handleSync = () => {
  console.log("同步云端最新试题数据");
};

const handleLaunchQuestions = () => {
  console.log("开始向全班发起提问，已选择题目 ID:", checkedQuestionIds.value);
};

const handleClose = () => {
  console.log("退出选题提问面板");
};
</script>

<style scoped lang="scss">
.full-screen-container {
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 1. 顶部页头 */
.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 24px;
  display: flex;
  align-items: center;

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 16px;

    .title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #1e293b;
    }

    .sync-time {
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

/* 2. 主体三栏布局 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧过滤器 & 目录树面板 */
.left-sidebar-panel {
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #f1f5f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .sidebar-title {
    font-size: 12px;
    font-weight: bold;
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f8fafc;
    }

    &.active {
      background-color: #f0f7f5;
      color: #529b85;
    }
  }
}

/* 题库 Tab 双选择钮 */
.tab-toggle-container {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.tab-sub-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 0;
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: #529b85;
    color: white;
  }
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .filter-label {
    font-size: 11px;
    font-weight: bold;
    color: #94a3b8;
  }
}

/* 左侧树形级联目录 */
.tree-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .tree-item-level1 {
    font-size: 13px;
    font-weight: bold;
    color: #334155;
    padding: 8px 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    .arrow {
      font-size: 8px;
      color: #94a3b8;
      transition: transform 0.2s;
    }
  }

  .tree-children {
    padding-left: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 2px;
  }

  .tree-item-level2 {
    font-size: 12px;
    color: #64748b;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: #f8fafc;
    }

    &.active {
      background-color: #f0f7f5;
      color: #529b85;
      font-weight: bold;
    }
  }
}

/* 中间题目展示列表 */
.center-content-panel {
  flex: 1;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部筛选行 */
.filter-header-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .filter-text-label {
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

/* 题目可滚动区域 */
.questions-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

/* 题目卡片 */
.question-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1.5px solid #f1f5f9;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
  transition: all 0.2s;

  &.checked {
    border-color: #529b85;
    background-color: #fcfdfe;
  }

  .card-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .q-index {
      font-size: 14px;
      font-weight: bold;
      color: #94a3b8;
    }

    .q-type-badge {
      background-color: #f1f5f9;
      color: #94a3b8;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .q-difficulty-badge {
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 6px;

      &.easy {
        background-color: #e6fcf1;
        color: #10b981;
      }
      &.medium {
        background-color: #fff7ed;
        color: #f97316;
      }
      &.hard {
        background-color: #fef2f2;
        color: #ef4444;
      }
    }

    .checkbox-wrapper {
      margin-left: auto;
      cursor: pointer;
    }

    .custom-checkbox {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #cbd5e1;
      border-radius: 6px;
      position: relative;
      box-sizing: border-box;
      transition: all 0.15s;

      &.checked {
        border-color: #529b85;
        background-color: #529b85;

        &::after {
          content: "";
          position: absolute;
          left: 6px;
          top: 2px;
          width: 4px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }
    }
  }

  .q-content-body {
    .stem-text {
      margin: 0;
      font-size: 14px;
      color: #334155;
      line-height: 1.6;
      font-weight: bold;
    }

    .sub-rich-text {
      margin-top: 10px;
      background-color: #fbfbfb;
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      color: #475569;
      line-height: 1.6;

      p {
        margin: 0;
      }
    }
  }
}

/* 右侧 Tab 垂直栏样式 */
.right-tab-panel {
  width: 100px;
  border-left: 1.5px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  background-color: #ffffff;
}

.tab-nav-item {
  padding: 18px 12px;
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b;
  }

  &.active {
    color: #529b85;
    background-color: #f0f7f5;
    border-left: 3px solid #529b85;
  }
}

/* 3. 底部固定控制栏 */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .selection-indicator {
    font-size: 13px;
    color: #64748b;

    .highlight-count {
      color: #529b85;
      font-weight: bold;
      font-size: 15px;
    }
  }
}

/* 按钮体系 */
.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-primary {
    background-color: #cbd5e1; // 默认置灰禁用态
    color: #f8fafc;
    cursor: not-allowed;

    &.active {
      background-color: #529b85;
      color: white;
      cursor: pointer;
    }
  }

  &-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-sync {
      color: #64748b;
    }
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 44px;
    padding: 0;
  }
}
</style>
