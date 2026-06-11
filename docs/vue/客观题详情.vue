<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">问</div>
        <div class="header-text">
          <h1 class="title">题目分析 • 第1题</h1>
        </div>
      </div>
    </div>

    <!-- 2. 主体内容区域 -->
    <div class="page-content">
      <!-- 左侧：题干与选项卡片 -->
      <div class="left-main-panel">
        <!-- 题型指示标记 -->
        <div class="question-type-bar">
          <span class="index-circle">1</span>
          <span class="type-text">单选</span>
        </div>

        <!-- 题干 -->
        <h2 class="question-stem">
          Which sentence uses the present perfect tense correctly?
        </h2>

        <!-- 选项列表 -->
        <div class="options-stack">
          <div
            v-for="opt in options"
            :key="opt.key"
            class="option-card"
            @click="handleOptionSelect(opt.key)"
          >
            <span class="option-badge">{{ opt.key }}</span>
            <span class="option-text">{{ opt.text }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：数据看板与作答分布 -->
      <div class="right-sidebar">
        <!-- 数据卡片行 -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="num">26</span>
            <span class="label">已作答</span>
          </div>
          <div class="stat-card">
            <span class="num">30</span>
            <span class="label">全班人数</span>
          </div>
        </div>

        <!-- 作答分布看板 -->
        <div class="distribution-section">
          <div class="section-header">
            <span class="section-title">作答分布</span>
            <span class="section-subtitle">设置答案后显示正误</span>
          </div>

          <div class="distribution-list">
            <div
              v-for="dist in distributions"
              :key="dist.label"
              class="dist-row"
              @click="handleViewStudentList(dist.label)"
            >
              <span class="dist-badge">{{ dist.label }}</span>
              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{ width: dist.percent + '%' }"
                ></div>
              </div>
              <div class="dist-meta">
                <span class="count">{{ dist.count }}人</span>
                <span class="percent">{{ dist.percent }}%</span>
              </div>
              <span class="arrow-down">▼</span>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="info-tip">
            <span class="info-icon">ⓘ</span>
            点击选项可以查看作答学生名单
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 底部固定控制与翻页栏 -->
    <div class="page-footer">
      <!-- 翻页控制 (左侧) -->
      <div class="pagination-wrapper">
        <button
          class="btn-pagination"
          :disabled="currentPage === 1"
          @click="changePage(-1)"
        >
          &lt; 上一题
        </button>
        <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="btn-pagination"
          :disabled="currentPage === totalPages"
          @click="changePage(1)"
        >
          下一题 &gt;
        </button>
      </div>

      <!-- 右侧动作按钮 -->
      <div class="footer-actions">
        <button class="btn btn-primary" @click="handleSetAnswers">
          设置答案
        </button>

        <div class="divider-line"></div>

        <button class="btn btn-outline" @click="handleShrink">
          <svg
            class="icon-shrink"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M380.16 380.16H160a32 32 0 0 1 0-64h156.16L128 128a32 32 0 0 1 45.248-45.248l188.16 188.16V160a32 32 0 0 1 64 0v220.16zM643.84 643.84H864a32 32 0 0 1 0 64H707.84L903.68 904a32 32 0 0 1-45.248 45.248l-195.84-195.84V864a32 32 0 0 1-64 0V643.84z"
              fill="currentColor"
            ></path>
          </svg>
          缩屏
        </button>
        <button class="btn btn-outline" @click="handleBack">
          <svg
            class="icon-reply"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M494.933 243.2a32 32 0 0 1 45.245 45.245L356.565 469.333H800a32 32 0 0 1 0 64H356.565l183.616 180.885a32 32 0 1 1-45.245 45.245l-237.44-233.9a32 32 0 0 1 0-45.245l237.437-237.12z"
              fill="currentColor"
            ></path>
          </svg>
          返回
        </button>
        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 题号分页数据
const currentPage = ref(1);
const totalPages = ref(4);

// A/B/C/D 选项数据
const options = ref([
  { key: "A", text: "A" },
  { key: "B", text: "B" },
  { key: "C", text: "C" },
  { key: "D", text: "D" },
]);

// 侧边栏柱状作答分布数据
const distributions = ref([
  { label: "A", count: 8, percent: 27 },
  { label: "B", count: 5, percent: 17 },
  { label: "C", count: 11, percent: 37 },
  { label: "D", count: 2, percent: 7 },
  { label: "未答", count: 4, percent: 13 },
]);

/**
 * 分页切换事件
 * @param {number} step 步长 (1 / -1)
 */
const changePage = (step) => {
  const target = currentPage.value + step;
  if (target >= 1 && target <= totalPages.value) {
    currentPage.value = target;
    console.log(`切换到第 ${target} 题`);
  }
};

/**
 * 选项点击事件
 * @param {string} key 选项键名
 */
const handleOptionSelect = (key) => {
  console.log(`点击了主面板选项: ${key}`);
};

/**
 * 查看对应选项的已选学生名单
 * @param {string} label 选项标签
 */
const handleViewStudentList = (label) => {
  console.log(`请求查看选择了 [${label}] 的学生名单`);
};

/**
 * 右下控制区回调
 */
const handleSetAnswers = () => {
  console.log("触发设置本题正确答案面板");
};

const handleShrink = () => {
  console.log("触发界面缩屏操作");
};

const handleBack = () => {
  console.log("返回前一页路由");
};

const handleMinimize = () => {
  console.log("最小化分析面板");
};

const handleClose = () => {
  console.log("关闭当前多题分析流程");
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
    align-items: center;
    gap: 12px;
  }

  .logo-badge {
    background-color: #529b85;
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .header-text {
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }
  }
}

/* 2. 主体核心区 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧主要区域 */
.left-main-panel {
  flex: 1;
  background-color: #fafaf8; /* 护眼米黄色背景 */
  padding: 32px 48px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 题型标记条 */
.question-type-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  .index-circle {
    background-color: #529b85;
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .type-text {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
  }
}

/* 题干 */
.question-stem {
  margin: 0 0 32px;
  font-size: 22px;
  font-weight: bold;
  color: #1e293b;
  line-height: 1.5;
}

/* 选项列表 */
.options-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
}

.option-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .option-badge {
    background-color: #f1f5f9;
    color: #64748b;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 13px;
  }

  .option-text {
    font-size: 15px;
    color: #334155;
    font-weight: bold;
  }
}

/* 右侧侧边栏 */
.right-sidebar {
  width: 320px;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 统计简版小卡片 */
.stats-row {
  display: flex;
  gap: 12px;

  .stat-card {
    flex: 1;
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 24px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 4px;
    }

    .label {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* 作答分布区块 */
.distribution-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    border-left: 3px solid #529b85;
    padding-left: 8px;

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #334155;
    }

    .section-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 6px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f8fafc;
  }

  .dist-badge {
    background-color: #f1f5f9;
    color: #64748b;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .progress-track {
    flex: 1;
    background-color: #f1f5f9;
    border-radius: 6px;
    height: 18px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background-color: #b7dbd1; /* 精致淡青绿柱体 */
    border-radius: 6px;
    transition: width 0.3s;
  }

  .dist-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 44px;

    .count {
      font-size: 12px;
      font-weight: bold;
      color: #334155;
    }

    .percent {
      font-size: 10px;
      color: #94a3b8;
    }
  }

  .arrow-down {
    font-size: 8px;
    color: #cbd5e1;
  }
}

/* 提示条 */
.info-tip {
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;

  .info-icon {
    font-size: 12px;
  }
}

/* 3. 底部固定控制与翻页栏 */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

/* 翻页器控制 (左侧) */
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;

  .btn-pagination {
    background-color: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    height: 38px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not([disabled]) {
      border-color: #529b85;
      color: #529b85;
    }

    &[disabled] {
      background-color: #f8fafc;
      color: #cbd5e1;
      border-color: #f1f5f9;
      cursor: not-allowed;
    }
  }

  .page-indicator {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
  }
}

/* 右侧通用行为按钮 */
.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

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
    background-color: #529b85;
    color: white;
  }

  &-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-shrink,
    .icon-reply {
      color: #64748b;
    }
  }

  &-icon {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    width: 38px;
    padding: 0;
  }

  &-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
