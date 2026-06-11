<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">问</div>
        <div class="header-text">
          <h1 class="title">多题答题分析</h1>
        </div>
      </div>
    </div>

    <!-- 2. 主体内容区域 -->
    <div class="page-content">
      <!-- ==================== TAB 1: 题目分析 ==================== -->
      <template v-if="currentTab === 'analysis'">
        <!-- 左侧：作答基础面板 -->
        <div class="left-stats-panel">
          <!-- 参与人数卡片 -->
          <div class="stats-card participant-card">
            <div class="stats-card-title">参与人数</div>
            <div class="stats-num-row">
              <span class="ratio">26<span class="total">/30</span></span>
              <span class="percent">87%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: 87%"></div>
            </div>
          </div>

          <!-- 作答情况圆环图卡片 -->
          <div class="stats-card chart-card">
            <div class="stats-card-title">作答情况</div>
            <div class="chart-wrapper">
              <!-- 纯CSS绘制的圆环图 -->
              <div class="donut-chart">
                <div class="chart-inner">
                  <span class="chart-num">26</span>
                  <span class="chart-label">已作答</span>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="dot dot-green"></span> 已作答 26人
              </div>
              <div class="legend-item">
                <span class="dot dot-grey"></span> 未作答 4人
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：题目分析列表 -->
        <div class="center-list-panel">
          <div class="panel-header">
            <div class="header-left-sub">
              <span class="panel-title">题目列表</span>
              <span class="badge-tag">4 题</span>
            </div>
            <div class="toggle-button-group">
              <button
                class="toggle-btn"
                :class="{ active: currentSort === 'index' }"
                @click="currentSort = 'index'"
              >
                按题号
              </button>
              <button
                class="toggle-btn"
                :class="{ active: currentSort === 'rate' }"
                @click="currentSort = 'rate'"
              >
                按低正确率
              </button>
            </div>
          </div>

          <!-- 题目选择列表 -->
          <div class="question-list">
            <div
              v-for="q in sortedQuestions"
              :key="q.id"
              class="question-item"
              @click="handleQuestionClick(q)"
            >
              <!-- 左侧状态指示色边 -->
              <div class="color-indicator" :class="q.colorClass"></div>

              <span class="q-index">{{ q.id }}</span>
              <span class="q-type-badge">{{ q.type }}</span>

              <!-- 作答分布徽章列表 -->
              <div class="options-distribution">
                <span
                  v-for="opt in q.options"
                  :key="opt.label"
                  class="dist-badge"
                  :class="{ 'badge-grey': opt.isNoAnswer }"
                >
                  {{ opt.label }} <span class="badge-val">{{ opt.value }}</span>
                </span>
              </div>

              <!-- 右侧跳转箭头 -->
              <span class="arrow-right">></span>
            </div>
          </div>

          <!-- 底部图例 -->
          <div class="panel-footer-legend">
            <span class="legend-item"
              ><span class="dot dot-red"></span> 正确率 &lt;60%</span
            >
            <span class="legend-item"
              ><span class="dot dot-orange"></span> 正确率 60-79%</span
            >
            <span class="legend-item"
              ><span class="dot dot-green"></span> 正确率 ≥80%</span
            >
          </div>
        </div>
      </template>

      <!-- ==================== TAB 2: 学生明细 ==================== -->
      <template v-else-if="currentTab === 'details'">
        <div class="details-main-panel">
          <div class="table-scroll-container">
            <table class="students-detail-table">
              <thead>
                <tr>
                  <th style="width: 60px">#</th>
                  <th style="width: 140px">姓名</th>
                  <th>用时</th>
                  <th>答题数</th>
                  <th>答对数</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in sortedStudents" :key="index">
                  <td class="col-index">{{ index + 1 }}</td>
                  <td class="col-name">{{ student.name }}</td>
                  <td class="col-time">{{ student.time }}</td>
                  <td class="col-count">{{ student.progress }}</td>
                  <td class="col-correct">{{ student.correctCount }}</td>
                  <!-- 单题答案微缩胶囊 -->
                  <td>
                    <span class="ans-pill">{{ student.q1 }}</span>
                  </td>
                  <td>
                    <span class="ans-pill">{{ student.q2 }}</span>
                  </td>
                  <td>
                    <span class="ans-pill font-bold">{{ student.q3 }}</span>
                  </td>
                  <td>
                    <span class="ans-pill">{{ student.q4 }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 学生明细底部操作与排序区 -->
          <div class="details-footer-bar">
            <span class="sort-label">排序:</span>
            <button
              class="sort-pill-btn"
              :class="{ active: studentSortMode === 'id' }"
              @click="studentSortMode = 'id'"
            >
              按学号
            </button>
            <button
              class="sort-pill-btn"
              :class="{ active: studentSortMode === 'correct' }"
              @click="studentSortMode = 'correct'"
            >
              按答对题数
            </button>
          </div>
        </div>
      </template>

      <!-- ==================== 右侧公共：Tab 导航栏 ==================== -->
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
        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 侧边栏双 Tab 控制: 'analysis' | 'details'
const tabs = [
  { id: "analysis", label: "题目分析" },
  { id: "details", label: "学生明细" },
];
const currentTab = ref("analysis");

// 排序规则: 'index' (按题号) | 'rate' (按低正确率)
const currentSort = ref("index");

// 学生明细排序规则: 'id' (按学号) | 'correct' (按答对题数)
const studentSortMode = ref("id");

// 题目列表数据集（含模拟正确率字段以支持动态正确率排序）
const questions = ref([
  {
    id: 1,
    type: "单选",
    colorClass: "danger", // 正确率 <60% (红色)
    correctRate: 27,
    options: [
      { label: "A", value: "27%" },
      { label: "B", value: "17%" },
      { label: "C", value: "37%" },
      { label: "D", value: "7%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 2,
    type: "多选",
    colorClass: "success", // 正确率 >=80% (绿色)
    correctRate: 85,
    options: [
      { label: "AC", value: "70%" },
      { label: "ABC", value: "7%" },
      { label: "BD", value: "3%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 3,
    type: "判断",
    colorClass: "warning", // 正确率 60-79% (橙色)
    correctRate: 63,
    options: [
      { label: "✓", value: "33%" },
      { label: "✕", value: "53%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 4,
    type: "数字",
    colorClass: "success",
    correctRate: 80,
    options: [
      { label: "36", value: "70%" },
      { label: "24", value: "7%" },
      { label: "12", value: "3%" },
      { label: "48", value: "3%" },
      { label: "未答", value: "17%", isNoAnswer: true },
    ],
  },
]);

// 题目列表计算属性，支持动态降序
const sortedQuestions = computed(() => {
  if (currentSort.value === "rate") {
    return [...questions.value].sort((a, b) => a.correctRate - b.correctRate);
  }
  return questions.value;
});

// 学生答题明细列表（16位模拟数据）
const studentsDetails = ref([
  {
    id: 1,
    name: "牛雯置",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "A",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 2,
    name: "施宇",
    time: "8s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 3,
    name: "苏雨潇",
    time: "9s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 4,
    name: "孙雨鹊",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "B",
    q2: "ABC",
    q3: "✓",
    q4: "24",
  },
  {
    id: 5,
    name: "汪月",
    time: "12s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 6,
    name: "杨诗雨",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 7,
    name: "张冰沁",
    time: "10s",
    progress: "4/4",
    correctCount: "—",
    q1: "A",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 8,
    name: "周梦泽",
    time: "7s",
    progress: "3/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "—",
  },
  {
    id: 9,
    name: "朱肖霖",
    time: "15s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 10,
    name: "冯智文",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "D",
    q2: "AC",
    q3: "✕",
    q4: "12",
  },
  {
    id: 11,
    name: "贾彦哲",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 12,
    name: "李奕乐",
    time: "8s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✓",
    q4: "36",
  },
  {
    id: 13,
    name: "周雪",
    time: "10s",
    progress: "3/4",
    correctCount: "—",
    q1: "C",
    q2: "—",
    q3: "✓",
    q4: "36",
  },
  {
    id: 14,
    name: "花雨泽",
    time: "11s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "48",
  },
  {
    id: 15,
    name: "陈思宇",
    time: "9s",
    progress: "4/4",
    correctCount: "—",
    q1: "B",
    q2: "BD",
    q3: "✓",
    q4: "36",
  },
  {
    id: 16,
    name: "刘昊然",
    time: "6s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
]);

// 学生列表排序计算属性
const sortedStudents = computed(() => {
  if (studentSortMode.value === "correct") {
    // 按答对数倒序（因无模拟计数值，这里仅作降序逻辑演示，真实开发可转为整型比较）
    return [...studentsDetails.value].sort((a, b) =>
      b.progress.localeCompare(a.progress),
    );
  }
  return studentsDetails.value;
});

/**
 * 题目行点击事件（原图1内交互保留）
 * @param {Object} question 被点击题目对象数据
 */
const handleQuestionClick = (question) => {
  console.log(`点击了题目 -> 题号: ${question.id}, 题型: ${question.type}`);
};

/**
 * 设置正确答案
 */
const handleSetAnswers = () => {
  console.log("触发设置答案面板");
};

/**
 * 系统控制命令
 */
const handleShrink = () => {
  console.log("触发缩屏操作");
};

const handleMinimize = () => {
  console.log("最小化窗口");
};

const handleClose = () => {
  console.log("关闭当前多题分析页面");
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
  overflow: hidden; /* 防止父容器本身溢出 */
}

/* ==================== TAB 1 题目分析样式 ==================== */
.left-stats-panel {
  width: 280px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .stats-card {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
    border: 1px solid #f1f5f9;

    .stats-card-title {
      font-size: 13px;
      font-weight: bold;
      color: #94a3b8;
      margin-bottom: 14px;
    }

    /* 参与人数排版 */
    .stats-num-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 12px;

      .ratio {
        font-size: 28px;
        font-weight: 800;
        color: #529b85;
        line-height: 1;

        .total {
          font-size: 15px;
          color: #94a3b8;
        }
      }

      .percent {
        font-size: 14px;
        font-weight: bold;
        color: #64748b;
      }
    }

    .progress-track {
      background-color: #f1f5f9;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background-color: #529b85;
      }
    }
  }
}

/* 模拟环形作答图 */
.chart-wrapper {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.donut-chart {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: conic-gradient(#529b85 0% 87%, #cbd5e1 87% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .chart-inner {
    width: 82px;
    height: 82px;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .chart-num {
      font-size: 20px;
      font-weight: 800;
      color: #1e293b;
    }

    .chart-label {
      font-size: 10px;
      color: #94a3b8;
    }
  }
}

.chart-legend {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .legend-item {
    font-size: 12px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.dot-green {
        background-color: #529b85;
      }
      &.dot-grey {
        background-color: #cbd5e1;
      }
    }
  }
}

/* 中间题目列表看板 */
.center-list-panel {
  flex: 1;
  padding: 16px 0 16px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-right: 24px;

  .header-left-sub {
    display: flex;
    align-items: center;
    gap: 8px;

    .panel-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }

    .badge-tag {
      background-color: #eef8f5;
      color: #529b85;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
}

/* 列表顶部题号/率切换组 */
.toggle-button-group {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  border: 1px solid #f1f5f9;
}

.toggle-btn {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: #ffffff;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
}

/* 题目卡片列表样式 */
.question-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 24px;
}

.question-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #fbfcfd;
  }

  .color-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;

    &.danger {
      background-color: #f87171;
    }
    &.warning {
      background-color: #f97316;
    }
    &.success {
      background-color: #10b981;
    }
  }

  .q-index {
    font-size: 16px;
    font-weight: bold;
    color: #1e293b;
    width: 28px;
  }

  .q-type-badge {
    background-color: #f1f5f9;
    color: #94a3b8;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 6px;
    margin-right: 24px;
  }
}

/* 作答选择百分比徽章组 */
.options-distribution {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dist-badge {
  background-color: #f0f7f5;
  border: 1px solid #d1eae2;
  color: #529b85;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 8px;

  .badge-val {
    color: #1e293b;
    margin-left: 4px;
  }

  &.badge-grey {
    background-color: #f8fafc;
    border-color: #f1f5f9;
    color: #94a3b8;
    .badge-val {
      color: #475569;
    }
  }
}

.arrow-right {
  margin-left: auto;
  font-size: 14px;
  color: #cbd5e1;
}

/* 底部图例 */
.panel-footer-legend {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: #94a3b8;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.dot-red {
        background-color: #f87171;
      }
      &.dot-orange {
        background-color: #f97316;
      }
      &.dot-green {
        background-color: #10b981;
      }
    }
  }
}

/* ==================== TAB 2 学生明细样式 ==================== */
.details-main-panel {
  flex: 1;
  padding: 16px 0 16px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 24px;
  border-radius: 12px;
}

.students-detail-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  thead {
    background-color: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 2;

    th {
      height: 48px;
      text-align: left;
      font-size: 13px;
      font-weight: bold;
      color: #94a3b8;
      padding: 0 16px;
      border-bottom: 1px solid #f1f5f9;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f8fafc;
      transition: background-color 0.15s;

      &:hover {
        background-color: #fafbfc;
      }

      td {
        height: 52px;
        padding: 0 16px;
        font-size: 13px;
        color: #475569;
      }
    }
  }

  .col-index {
    color: #94a3b8;
    font-weight: bold;
  }

  .col-name {
    font-weight: bold;
    color: #1e293b;
    font-size: 14px;
  }

  .ans-pill {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 6px 14px;
    font-size: 12px;
    color: #334155;
    display: inline-block;
    text-align: center;
    min-width: 44px;
    box-sizing: border-box;

    &.font-bold {
      font-weight: bold;
      font-size: 14px;
    }
  }
}

/* 明细下部排序操作栏 */
.details-footer-bar {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;

  .sort-label {
    font-size: 12px;
    color: #94a3b8;
  }
}

.sort-pill-btn {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 12px;
  font-weight: bold;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  height: 32px;
  line-height: 18px;
  transition: all 0.15s;

  &:hover {
    border-color: #529b85;
    color: #529b85;
  }

  &.active {
    background-color: #eef8f5;
    border-color: #529b85;
    color: #529b85;
  }
}

/* ==================== 右侧：Tab 垂直栏样式 ==================== */
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

/* ==================== 3. 底部固定控制栏 ==================== */
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
  gap: 12px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

/* 统一按钮设计 */
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

    .icon-shrink {
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
