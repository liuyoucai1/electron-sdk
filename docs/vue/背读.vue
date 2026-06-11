<template>
  <div class="page-container">
    <div class="content-card">
      <!-- 页面头部 -->
      <div class="card-header">
        <h2 class="title">请选择背诵内容</h2>
      </div>

      <!-- 页面主体：采用三栏或两栏自适应布局 -->
      <div class="card-body">
        <!-- 左侧过滤器栏：仅在“教材” Tab 下显示 -->
        <div v-if="currentTab === 'textbook'" class="left-filter-panel">
          <div class="select-wrapper">
            <span class="filter-label">选科目</span>
            <el-select
              v-model="selectedSubject"
              placeholder="请选择科目"
              size="large"
            >
              <el-option label="英语" value="english" />
            </el-select>
          </div>

          <div class="select-wrapper">
            <span class="filter-label">选教材</span>
            <el-select
              v-model="selectedBook"
              placeholder="请选择教材"
              size="large"
            >
              <el-option label="初二上册人教部编版" value="grade8_1" />
            </el-select>
          </div>

          <!-- 树形单元目录 -->
          <div class="tree-menu">
            <div
              class="tree-item-level1"
              :class="{ active: activeUnit === 'all' }"
              @click="activeUnit = 'all'"
            >
              <span class="arrow-placeholder"></span>
              全部
            </div>

            <div class="tree-group">
              <div
                class="tree-item-level1"
                :class="{ active: activeUnit === 'unit1' }"
                @click="toggleUnit('unit1')"
              >
                <span class="arrow" :class="{ expanded: unitExpanded.unit1 }"
                  >▼</span
                >
                Unit 1 Happy Holiday
              </div>
              <div v-show="unitExpanded.unit1" class="tree-children">
                <div
                  class="tree-item-level2"
                  :class="{ active: activeSection === 'secA' }"
                  @click="activeSection = 'secA'"
                >
                  Section A
                </div>
                <div
                  class="tree-item-level2"
                  :class="{ active: activeSection === 'secB' }"
                  @click="activeSection = 'secB'"
                >
                  Section B
                </div>
              </div>
            </div>

            <div class="tree-item-level1" @click="toggleUnit('unit2')">
              <span class="arrow" :class="{ expanded: unitExpanded.unit2 }"
                >▶</span
              >
              Unit 2 Home Sweet Home
            </div>

            <div class="tree-item-level1" @click="toggleUnit('unit3')">
              <span class="arrow" :class="{ expanded: unitExpanded.unit3 }"
                >▶</span
              >
              Unit 3 Same or Different
            </div>
          </div>
        </div>

        <!-- 中间/主要内容区域 -->
        <div class="center-content-panel">
          <!-- TAB 1: 教材内容列表 -->
          <template v-if="currentTab === 'textbook'">
            <div class="content-header-title">Unit 1 Happy Holiday</div>
            <div class="recitation-list">
              <div
                v-for="item in textbookItems"
                :key="item.id"
                class="recitation-item"
                :class="{ active: selectedTextbookItem === item.id }"
                @click="selectedTextbookItem = item.id"
              >
                <span
                  class="radio-indicator"
                  :class="{ checked: selectedTextbookItem === item.id }"
                ></span>
                <div class="item-body">
                  <div class="item-title">{{ item.title }}</div>
                  <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 2: 临时自编区 -->
          <template v-else-if="currentTab === 'custom'">
            <div class="custom-input-header">
              <span class="content-header-title">自定义背诵内容</span>
              <button class="btn-voice-input" @click="handleVoiceInput">
                <span class="icon-mic">🎤</span> 语音录入
              </button>
            </div>
            <div class="textarea-container">
              <textarea
                v-model="customText"
                class="custom-textarea"
                placeholder="请输入内容或者点击语音录入按钮使用语音输入"
              ></textarea>
            </div>
          </template>

          <!-- TAB 3: 满分作文列表 -->
          <template v-else-if="currentTab === 'essay'">
            <div class="content-header-title">精选满分作文</div>
            <div class="recitation-list">
              <div
                v-for="item in essayItems"
                :key="item.id"
                class="recitation-item"
                :class="{ active: selectedEssayItem === item.id }"
                @click="selectedEssayItem = item.id"
              >
                <span
                  class="radio-indicator"
                  :class="{ checked: selectedEssayItem === item.id }"
                ></span>
                <div class="item-body">
                  <div class="item-title">{{ item.title }}</div>
                  <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 右侧：Tab 垂直切换栏 -->
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

      <!-- 底部固定评分及操作栏 -->
      <div class="card-footer">
        <div class="footer-left">
          <span class="standard-label">评分标准</span>
          <el-select v-model="scoreStandard" size="large" style="width: 140px">
            <el-option label="标准背诵" value="standard" />
          </el-select>
          <span class="standard-desc">
            通用型英语背诵检查，背对背全是核心，兼顾发音和流利度，适用所有年级。
          </span>
        </div>
        <div class="footer-right">
          <!-- “按段落选择”按钮：仅在教材和满分作文 Tab 下展示 -->
          <button
            v-if="currentTab === 'textbook' || currentTab === 'essay'"
            class="btn btn-outline"
            @click="handleParagraphSelect"
          >
            按段落选择
          </button>
          <button class="btn btn-primary" @click="handleStart">开始背诵</button>
          <button class="btn btn-close-icon" @click="handleCancel">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 侧边栏 Tab 声明
const tabs = [
  { id: "textbook", label: "教材" },
  { id: "custom", label: "临时自编" },
  { id: "essay", label: "满分作文" },
];
const currentTab = ref("textbook");

// 学科与教材选择变量
const selectedSubject = ref("english");
const selectedBook = ref("grade8_1");

// 左侧单元目录展开/激活控制
const activeUnit = ref("unit1");
const activeSection = ref("secA");
const unitExpanded = ref({
  unit1: true,
  unit2: false,
  unit3: false,
});

const toggleUnit = (unitKey) => {
  unitExpanded.value[unitKey] = !unitExpanded.value[unitKey];
  activeUnit.value = unitKey;
};

// 评分标准
const scoreStandard = ref("standard");

// 教材 Tab 背诵项
const textbookItems = ref([
  {
    id: "word",
    title: "单词",
    desc: "Ancient/camp/strange/vacation/fantastic/town/take sb's breath away...",
  },
  {
    id: "secA_1b",
    title: "Section A 1b and 1c",
    desc: "Conversation 1Hi, Yaming. How was your vacation?",
  },
  {
    id: "secA_2a",
    title: "Section A 2a and 2d",
    desc: "Hi, Peter. How are you?Hi, Adam. I'm fine...",
  },
  { id: "secA_3a", title: "Section A 3a", desc: "" },
]);
const selectedTextbookItem = ref("word");

// 临时自编输入文本
const customText = ref("");

// 满分作文 Tab 列表项
const essayItems = ref([
  {
    id: "my_ideal",
    title: "我的理想",
    desc: "每个人都有自己的理想，我的理想是成为一名优秀的教师...",
  },
  {
    id: "memorable_day",
    title: "难忘的一天",
    desc: "那是一个阳光明媚的早晨，我和家人一起去爬山...",
  },
  {
    id: "my_hometown",
    title: "我爱我的家乡",
    desc: "我的家乡是一个美丽的小镇，那里山清水秀...",
  },
]);
const selectedEssayItem = ref("my_ideal");

/**
 * 语音输入触发事件
 */
const handleVoiceInput = () => {
  console.log("启动自定义背诵内容的语音录入功能");
};

/**
 * 按段落选择触发事件
 */
const handleParagraphSelect = () => {
  console.log("跳转至按段落选择子功能");
};

/**
 * 开始背诵触发事件
 */
const handleStart = () => {
  const payload = {
    tab: currentTab.value,
    standard: scoreStandard.value,
  };
  if (currentTab.value === "textbook") {
    payload.contentId = selectedTextbookItem.value;
  } else if (currentTab.value === "custom") {
    payload.content = customText.value;
  } else {
    payload.contentId = selectedEssayItem.value;
  }
  console.log("启动背诵检测:", payload);
};

/**
 * 退出/取消当前操作
 */
const handleCancel = () => {
  console.log("取消选择背诵内容并退出");
};
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-card {
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  min-height: 650px;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 页面头部 */
.card-header {
  padding: 20px 32px;
  border-bottom: 1.5px solid #f1f5f9;

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }
}

/* 页面主体 */
.card-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧过滤器（仅在“教材”下渲染） */
.left-filter-panel {
  width: 260px;
  border-right: 1.5px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .filter-label {
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
    }
  }
}

/* 树形单元目录样式 */
.tree-menu {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .tree-item-level1 {
    font-size: 14px;
    font-weight: 700;
    color: #475569;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      background-color: #f8fafc;
    }

    &.active {
      background-color: #f2f8f6;
      color: #529b85;
    }

    .arrow-placeholder {
      width: 12px;
    }

    .arrow {
      font-size: 10px;
      width: 12px;
      color: #94a3b8;
      transition: transform 0.2s;

      &.expanded {
        color: #529b85;
      }
    }
  }

  .tree-children {
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 2px;
  }

  .tree-item-level2 {
    font-size: 13px;
    color: #64748b;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: #f8fafc;
      color: #334155;
    }

    &.active {
      color: #529b85;
      font-weight: 700;
    }
  }
}

/* 中间主要展示内容 */
.center-content-panel {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .content-header-title {
    font-size: 15px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 16px;
  }
}

/* 自定义输入区头部 */
.custom-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-voice-input {
  background-color: #f0f7f5;
  border: 1.5px solid #d1eae2;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #529b85;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #e2f2ed;
  }
}

/* 文本录入域容器 */
.textarea-container {
  flex: 1;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background-color: #fafbfb;
  display: flex;
}

.custom-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 15px;
  color: #334155;
  outline: none;
  line-height: 1.6;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
  }
}

/* 列表背诵选项 */
.recitation-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recitation-item {
  display: flex;
  align-items: flex-start;
  padding: 18px 24px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8fafc;
  }

  &.active {
    border-color: #529b85;
    background-color: #f0f7f5;
  }

  .radio-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    margin-right: 16px;
    margin-top: 2px;
    box-sizing: border-box;
    position: relative;
    transition: all 0.2s;

    &.checked {
      border-color: #529b85;
      background-color: #529b85;

      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .item-body {
    flex: 1;

    .item-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .item-desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.4;
    }
  }
}

/* 右侧 Tab 导航栏 */
.right-tab-panel {
  width: 100px;
  border-left: 1.5px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
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

    &::left {
      content: "";
    }

    /* 模拟左侧绿色定位边框 */
    border-left: 3px solid #529b85;
  }
}

/* 底部操作区 */
.card-footer {
  padding: 20px 32px;
  background-color: #ffffff;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .standard-label {
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
    }

    .standard-desc {
      font-size: 13px;
      color: #94a3b8;
      border-left: 1.5px solid #e2e8f0;
      padding-left: 12px;
      margin-left: 4px;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* 按钮样式体系 */
.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-primary {
    background-color: #529b85;
    color: white;
  }

  &-outline {
    background-color: white;
    border: 1.5px solid #529b85;
    color: #529b85;
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
