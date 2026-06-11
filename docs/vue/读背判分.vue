<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">背</div>
        <div class="header-text">
          <h1 class="title">背诵分析</h1>
          <span class="subtitle">单词</span>
        </div>
      </div>
    </div>

    <!-- 2. 主体核心区域 -->
    <div class="page-content">
      <!-- 左侧：文本内容预览 & 学生网格 -->
      <div class="left-main-panel">
        <!-- 课文内容折叠条 -->
        <div class="text-preview-card" :class="{ expanded: isTextExpanded }">
          <p class="preview-paragraph">
            Ancient, camp, strange, vacation, fantastic, town, take sb's breath
            away, everywhere, quiet, palace, amazing, building, lake, hill,
            bridge, stone, cross, magic, pull, wake, believe...
            <span v-show="isTextExpanded">
              and more paragraph text can go here for demonstration when
              expanded.
            </span>
          </p>
          <button
            class="btn-toggle-expand"
            @click="isTextExpanded = !isTextExpanded"
          >
            {{ isTextExpanded ? "收起内容" : "展开内容" }}
            <span class="arrow-icon" :class="{ up: isTextExpanded }">▼</span>
          </button>
        </div>

        <!-- 学生卡片网格容器 -->
        <div class="students-grid-container">
          <div class="grid-layout">
            <div
              v-for="(student, index) in students"
              :key="index"
              class="student-card"
            >
              <div class="student-name">{{ student.name }}</div>
              <span class="status-badge" :class="student.status">
                {{ getStatusLabel(student.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：数据看板侧边栏 -->
      <div class="right-sidebar">
        <!-- 作答基础统计 -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="num">26</span>
            <span class="label">已作答</span>
          </div>
          <div class="stat-card">
            <span class="num">30</span>
            <span class="label">全班人数</span>
          </div>
          <div class="stat-card rate-card">
            <span class="num highlight">88%</span>
            <span class="label">通过率</span>
          </div>
        </div>

        <!-- 评分设置折叠板 -->
        <div class="collapse-item">
          <div class="collapse-header" @click="toggleGradingSettings">
            <span class="label-title">评分设置</span>
            <span class="action-link"
              >展开查看 <span class="arrow">▼</span></span
            >
          </div>
        </div>

        <!-- 作答分布图表区 -->
        <div class="distribution-section">
          <h3 class="section-title">作答分布</h3>
          <div class="distribution-list">
            <div
              v-for="dist in distributions"
              :key="dist.status"
              class="dist-row"
            >
              <span class="dist-label" :class="dist.status">{{
                dist.label
              }}</span>
              <div class="progress-track">
                <div
                  class="progress-bar"
                  :class="dist.status"
                  :style="{ width: dist.percent + '%' }"
                ></div>
              </div>
              <div class="dist-count-box">
                <span class="count">{{ dist.count }}人</span>
                <span class="percent">{{ dist.percent }}%</span>
              </div>
              <span class="arrow-down">▼</span>
            </div>
          </div>
        </div>

        <!-- AI 评分结果面板 -->
        <div class="ai-status-panel">
          <div class="status-icon-box">
            <svg
              class="check-svg"
              viewBox="0 0 1024 1024"
              width="16"
              height="16"
            >
              <path
                d="M380.16 746.432l-233.92-233.952a32 32 0 1 1 45.248-45.248l188.672 188.704L832.512 205.6a32 32 0 1 1 45.248 45.248l-497.6 495.584z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <div class="ai-info">
            <div class="ai-title">AI评分完成</div>
            <div class="ai-desc">所有学生已完成自动评分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 底部全屏系统控制栏 -->
    <div class="page-footer">
      <div class="footer-actions">
        <!-- 缩屏 -->
        <button class="btn-ctrl btn-outline" @click="handleShrink">
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
        <!-- 最小化 -->
        <button class="btn-ctrl btn-icon" @click="handleMinimize">—</button>
        <!-- 关闭 -->
        <button class="btn-ctrl btn-close" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 文本折叠控制
const isTextExpanded = ref(false);

// 30位学生模拟数据及对应评价等级
const students = ref([
  { name: "张三", status: "excellent" },
  { name: "李四", status: "good" },
  { name: "王五", status: "pass" },
  { name: "赵六", status: "needs-improvement" },
  { name: "孙七", status: "excellent" },
  { name: "周八", status: "good" },
  { name: "吴九", status: "pass" },

  { name: "郑十", status: "excellent" },
  { name: "钱一", status: "good" },
  { name: "陈二", status: "excellent" },
  { name: "刘三", status: "excellent" },
  { name: "林四", status: "pass" },
  { name: "黄五", status: "needs-improvement" },
  { name: "何六", status: "excellent" },

  { name: "马七", status: "good" },
  { name: "许八", status: "pass" },
  { name: "朱九", status: "excellent" },
  { name: "胡十", status: "good" },
  { name: "郭一", status: "excellent" },
  { name: "罗二", status: "good" },
  { name: "高三", status: "pass" },

  { name: "梁四", status: "excellent" },
  { name: "宋五", status: "good" },
  { name: "韩六", status: "needs-improvement" },
  { name: "唐七", status: "excellent" },
  { name: "冯八", status: "good" },
  { name: "未答一", status: "unanswered" },
  { name: "未答二", status: "unanswered" },

  { name: "未答三", status: "unanswered" },
  { name: "未答四", status: "unanswered" },
]);

// 统计分布数据
const distributions = ref([
  { status: "excellent", label: "优秀", count: 10, percent: 33 },
  { status: "good", label: "良好", count: 8, percent: 27 },
  { status: "pass", label: "及格", count: 5, percent: 17 },
  { status: "needs-improvement", label: "待改进", count: 3, percent: 10 },
  { status: "unanswered", label: "未答", count: 4, percent: 13 },
]);

// 映射对应标签文字
const getStatusLabel = (status) => {
  const map = {
    excellent: "优秀",
    good: "良好",
    pass: "及格",
    "needs-improvement": "待改进",
    unanswered: "未答",
  };
  return map[status] || "";
};

const toggleGradingSettings = () => {
  console.log("点击折叠/展开评分设置面板");
};

const handleShrink = () => {
  console.log("触发界面缩屏操作");
};

const handleMinimize = () => {
  console.log("触发最小化窗口");
};

const handleClose = () => {
  console.log("关闭当前背诵分析面板");
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
    display: flex;
    align-items: baseline;
    gap: 8px;

    .title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }

    .subtitle {
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

/* 2. 主体核心区域 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden; /* 防止外层整体滚动 */
}

/* 左侧大栏 */
.left-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow: hidden;
}

/* 课文段落内容展示条 */
.text-preview-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
  transition: all 0.25s ease-in-out;

  &.expanded {
    .preview-paragraph {
      white-space: normal;
    }
  }

  .preview-paragraph {
    margin: 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-toggle-expand {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: #64748b;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;

    &:hover {
      background-color: #f8fafc;
    }

    .arrow-icon {
      font-size: 8px;
      transition: transform 0.2s;
      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

/* 学生卡片自适应容器 */
.students-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 匹配原图的 7 列布局 */
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (max-width: 850px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.student-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  .student-name {
    font-size: 14px;
    font-weight: bold;
    color: #1e293b;
  }
}

/* 状态等级标签 */
.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;

  &.excellent {
    background-color: #e6fcf1;
    color: #10b981;
  }
  &.good {
    background-color: #f0f7f5;
    color: #529b85;
  }
  &.pass {
    background-color: #eef8f6;
    color: #84baa8;
  }
  &.needs-improvement {
    background-color: #fef2f2;
    color: #f87171;
  }
  &.unanswered {
    background-color: #f1f5f9;
    color: #94a3b8;
  }
}

/* 右侧侧边栏 */
.right-sidebar {
  width: 320px;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* 统计卡片行 */
.stats-row {
  display: flex;
  gap: 10px;

  .stat-card {
    flex: 1;
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 20px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 4px;
    }

    .label {
      font-size: 11px;
      color: #94a3b8;
    }

    &.rate-card {
      background-color: #f0f7f5;
      .num.highlight {
        color: #529b85;
      }
    }
  }
}

/* 折叠设置行 */
.collapse-item {
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 14px 0;

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .label-title {
      font-size: 14px;
      font-weight: bold;
      color: #334155;
    }

    .action-link {
      font-size: 12px;
      color: #529b85;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 4px;

      .arrow {
        font-size: 8px;
        color: #94a3b8;
      }
    }
  }
}

/* 作答分布区块 */
.distribution-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-title {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #334155;
    border-left: 3px solid #529b85;
    padding-left: 8px;
  }
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;

  .dist-label {
    width: 44px;
    font-size: 12px;
    font-weight: bold;
    text-align: left;

    &.excellent {
      color: #10b981;
    }
    &.good {
      color: #529b85;
    }
    &.pass {
      color: #84baa8;
    }
    &.needs-improvement {
      color: #f87171;
    }
    &.unanswered {
      color: #94a3b8;
    }
  }

  .progress-track {
    flex: 1;
    background-color: #f8fafc;
    border-radius: 6px;
    height: 18px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    border-radius: 6px;

    &.excellent {
      background-color: #10b981;
    }
    &.good {
      background-color: #529b85;
    }
    &.pass {
      background-color: #84baa8;
    }
    &.needs-improvement {
      background-color: #f87171;
    }
    &.unanswered {
      background-color: #cbd5e1;
    }
  }

  .dist-count-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 40px;

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
    cursor: pointer;
  }
}

/* AI评分完成提示区 */
.ai-status-panel {
  margin-top: auto; /* 置底显示 */
  background-color: #f0f7f5;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .status-icon-box {
    background-color: #e1f2ed;
    color: #529b85;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-info {
    .ai-title {
      font-size: 13px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 2px;
    }

    .ai-desc {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* 3. 底部固定系统控制栏 */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ctrl {
  border: none;
  border-radius: 10px;
  height: 38px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &.btn-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-shrink {
      color: #64748b;
    }
  }

  &.btn-icon {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    width: 38px;
    padding: 0;
  }

  &.btn-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
