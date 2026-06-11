<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <!-- 提示：点击左侧“语”字图标可以随时重置并切换场景状态 -->
        <div class="logo-badge" title="点击重置切换场景" @click="resetScene">
          语
        </div>
        <div class="header-text">
          <h1 class="title">语音分析</h1>
          <span class="subtitle">语音题答题结果</span>
        </div>
      </div>
    </div>

    <!-- 2. 主体核心区域 -->
    <div class="page-content">
      <!-- ==================== 左边栏：高频词云与优秀作答 ==================== -->
      <div class="left-sidebar">
        <!-- 高频词云 -->
        <div class="widget-card word-cloud-card">
          <h3 class="widget-title">高频词云 <span class="tag">Top 10</span></h3>
          <div class="word-cloud-container">
            <span class="word w-xl col-black p1">老师</span>
            <span class="word w-lg col-green p2">学习</span>
            <span class="word w-md col-teal p3">阳光</span>
            <span class="word w-lg col-green p4">快乐</span>
            <span class="word w-xl col-black p5">友谊</span>
            <span class="word w-lg col-teal p6">活动</span>
            <span class="word w-sm col-green p7">团结</span>
            <span class="word w-md col-green p8">操场</span>
            <span class="word w-sm col-teal p9">图书馆</span>
            <span class="word w-sm col-green p10">自由</span>
          </div>
        </div>

        <!-- 优秀作答分享 -->
        <div class="widget-card share-card">
          <h3 class="widget-title">优秀作答分享</h3>

          <!-- 图 1 状态：未出题未评分占位 -->
          <div v-if="!hasQuestion" class="placeholder-wrapper">
            <div class="warn-icon-circle">!</div>
            <div class="place-title">评分后可生成优秀作答</div>
            <div class="place-desc">请先设置题目并评分</div>
          </div>

          <!-- 图 2 状态：生成优秀作答卡片列表 -->
          <div v-else class="outstanding-answers-list">
            <div
              v-for="ans in excellentAnswers"
              :key="ans.name"
              class="excellent-card"
            >
              <div class="card-title-row">
                <span class="avatar-circle" :class="ans.level">{{
                  ans.name.charAt(0)
                }}</span>
                <span class="name">{{ ans.name }}</span>
              </div>
              <p class="answer-text">{{ ans.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 中间大栏：题目状态与学生作答列表 ==================== -->
      <div class="center-main-panel">
        <!-- 图 1 状态：未出题头部生成卡片 -->
        <div v-if="!hasQuestion" class="question-generator-card">
          <h2 class="prompt-title">暂无题目内容</h2>
          <p class="prompt-subtitle">请选择出题方式</p>
          <div class="method-buttons">
            <button class="btn btn-outline" @click="simulateSetQuestion">
              <span class="btn-icon">🎤</span> 语音出题
            </button>
            <button class="btn btn-outline" @click="simulateSetQuestion">
              <span class="btn-icon">🔲</span> 截屏出题
            </button>
          </div>
        </div>

        <!-- 图 2 状态：展示具体题目内容卡片 -->
        <div
          v-else
          class="question-display-card"
          :class="{ expanded: isQuestionExpanded }"
        >
          <p class="question-stem">
            请描述你心目中理想的校园生活是什么样的？可以从学习环境、课外活动、师生关系等方面谈谈你的想法。
          </p>
          <button
            class="btn-toggle-expand"
            @click="isQuestionExpanded = !isQuestionExpanded"
          >
            {{ isQuestionExpanded ? "收起题目" : "展开题目" }}
            <span class="arrow" :class="{ up: isQuestionExpanded }">▼</span>
          </button>
        </div>

        <!-- 学生作答列表 -->
        <div class="student-answers-section">
          <div class="section-header">
            <span class="section-title">学生作答</span>
            <span class="section-subtitle">(语音转文本)</span>
          </div>

          <div class="answers-scroll-list">
            <div
              v-for="student in students"
              :key="student.name"
              class="student-answer-card"
            >
              <div class="card-left-info">
                <span class="student-name">{{ student.name }}</span>
                <!-- 动态变化徽章：未出题显示待评分(灰色)，已出题显示实际得分色 -->
                <span
                  class="status-badge"
                  :class="hasQuestion ? student.status : 'pending'"
                >
                  {{ hasQuestion ? getStatusLabel(student.status) : "待评分" }}
                </span>
              </div>
              <p class="transcribed-text">{{ student.text }}</p>
              <button
                class="btn-play-audio"
                @click="handlePlayAudio(student.name)"
              >
                <span class="play-arrow"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 右侧侧边栏：数据看板 ==================== -->
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
          <div class="stat-card rate-card">
            <span class="num highlight">{{ hasQuestion ? "94%" : "0%" }}</span>
            <span class="label">通过率</span>
          </div>
        </div>

        <!-- 折叠评分设置行 (仅已设置题目图2展示) -->
        <div v-if="hasQuestion" class="collapse-item">
          <div class="collapse-header" @click="toggleGradingSettings">
            <span class="label-title">评分设置</span>
            <span class="action-link"
              >展开查看 <span class="arrow">▼</span></span
            >
          </div>
        </div>

        <!-- 作答分布区块 -->
        <div class="distribution-section">
          <h3 class="section-title">作答分布</h3>

          <!-- 图 1 状态：未出题占位 -->
          <div v-if="!hasQuestion" class="chart-placeholder">
            <div class="bar-chart-mini">
              <span class="bar b1"></span>
              <span class="bar b2"></span>
              <span class="bar b3"></span>
            </div>
            <p class="placeholder-text">设置题目后显示评分分布</p>
          </div>

          <!-- 图 2 状态：显示具体分布柱状图 -->
          <div v-else class="distribution-list">
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

        <!-- AI 评分结果/预警面板 -->
        <!-- 图 1 状态：警告提示 -->
        <div v-if="!hasQuestion" class="ai-status-panel warning-mode">
          <div class="status-icon-box">!</div>
          <div class="ai-info">
            <div class="ai-title">AI评分</div>
            <div class="ai-desc">请先设置题目再进行AI评分</div>
          </div>
        </div>

        <!-- 图 2 状态：完成提示 -->
        <div v-else class="ai-status-panel success-mode">
          <div class="status-icon-box">✓</div>
          <div class="ai-info">
            <div class="ai-title">AI评分完成</div>
            <div class="ai-desc">所有学生已完成自动评分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 底部固定控制栏 -->
    <div class="page-footer">
      <div class="footer-left">
        <button class="btn btn-outline" @click="handleAiSimilar">
          <span class="icon-sparkle">✦</span> AI相似题
        </button>
      </div>
      <div class="footer-actions">
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
import { ref } from "vue";

// 核心状态切换（切换图1/图2场景，默认为未设置题目的图1状态）
const hasQuestion = ref(false);

// 题目折叠变量（仅图2场景可用）
const isQuestionExpanded = ref(false);

// 学生名单数据，其中评定结果包括优秀/良好/及格
const students = ref([
  {
    name: "张三",
    status: "excellent",
    text: "我理想的校园充满阳光，同学们在操场上奔跑，图书馆里安静学习，老师耐心讲解。",
  },
  {
    name: "李四",
    status: "good",
    text: "理想校园应该有丰富的社团活动，让同学们找到自己的兴趣，结交志同道合的朋友。",
  },
  {
    name: "王五",
    status: "pass",
    text: "校园里要有宽阔的运动场地，课间可以打球，学习和运动都不耽误。",
  },
  {
    name: "赵六",
    status: "excellent",
    text: "我希望校园里有更多绿色植物，环境优美，让我们心情舒畅，学习效率也会更高。",
  },
  {
    name: "孙七",
    status: "excellent",
    text: "理想的校园要师生关系融洽，老师像朋友一样和我们交流，不只是讲课。",
  },
  {
    name: "周八",
    status: "good",
    text: "校园应该有先进的设备，科学实验室、计算机房都要齐全，支持我们探索学习。",
  },
  {
    name: "吴九",
    status: "pass",
    text: "我向向往自由开放的校园氛围，让同学们敢于表达自己的想法和创意。",
  },
  {
    name: "郑十",
    text: "理想校园里有专业的心理辅导室，帮助同学们解决成长中的烦恼和压力。",
    status: "excellent",
  },
  {
    name: "钱一",
    text: "最喜欢校园里有各种文化展示区，展现同学们的作品，互相欣赏和激励。",
    status: "good",
  },
]);

// 优秀作答数据（图 2 场景）
const excellentAnswers = ref([
  {
    name: "张三",
    level: "excellent",
    text: "我理想的校园充满阳光，同学们在操场上奔跑，图书馆里安静学习，老师耐心讲解，每个人都能找到自己的闪光点。",
  },
  {
    name: "王五",
    level: "pass",
    text: "校园应该是自由开放的地方，有丰富的社团活动和多样的课外读物，让我们在快乐中成长。",
  },
  {
    name: "陈二",
    level: "excellent",
    text: "理想校园里师生关系融洽，像朋友一样交流，课外活动和团队合作让我们更有凝聚力。",
  },
]);

// 统计分布数据（图 2 场景）
const distributions = ref([
  { status: "excellent", label: "优秀", count: 7, percent: 23 },
  { status: "good", label: "良好", count: 4, percent: 13 },
  { status: "pass", label: "及格", count: 4, percent: 13 },
  { status: "needs-improvement", label: "待改进", count: 1, percent: 3 },
  { status: "unanswered", label: "未答", count: 4, percent: 13 },
]);

// 状态文字映射
const getStatusLabel = (status) => {
  const map = {
    excellent: "优秀",
    good: "良好",
    pass: "及格",
    "needs-improvement": "待改进",
    unanswered: "未答",
  };
  return map[status] || "待评分";
};

/**
 * 场景模拟交互
 */
const simulateSetQuestion = () => {
  hasQuestion.value = true;
  console.log("模拟：出题完成，进入评分统计状态（图 2）");
};

const resetScene = () => {
  hasQuestion.value = false;
  console.log("模拟：清空题目设置，切回未出题初始状态（图 1）");
};

const toggleGradingSettings = () => {
  console.log("折叠或展开评分设置看板");
};

const handlePlayAudio = (name) => {
  console.log(`播放学生录音 -> 姓名: ${name}`);
};

/**
 * 通用功能流
 */
const handleAiSimilar = () => {
  console.log("匹配 AI 语音相似题库");
};

const handleShrink = () => {
  console.log("触发界面缩屏操作");
};

const handleMinimize = () => {
  console.log("最小化分析面板");
};

const handleClose = () => {
  console.log("退出语音分析页面");
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
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s;

    &:active {
      opacity: 0.8;
    }
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

/* 2. 主体三栏内容 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px 24px;
  gap: 20px;
}

/* ==================== 左边栏 ==================== */
.left-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.widget-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;

  .widget-title {
    margin: 0 0 14px;
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tag {
      background-color: #f1f5f9;
      color: #94a3b8;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  &.word-cloud-card {
    height: 220px;
  }

  &.share-card {
    flex: 1;
    overflow: hidden;
  }
}

/* 词云模拟定位排版 */
.word-cloud-container {
  flex: 1;
  position: relative;
  overflow: hidden;

  .word {
    position: absolute;
    font-weight: bold;
    white-space: nowrap;

    /* 字号配置 */
    &.w-xl {
      font-size: 24px;
    }
    &.w-lg {
      font-size: 18px;
    }
    &.w-md {
      font-size: 14px;
    }
    &.w-sm {
      font-size: 12px;
    }

    /* 颜色配置 */
    &.col-black {
      color: #1e293b;
    }
    &.col-green {
      color: #529b85;
    }
    &.col-teal {
      color: #81b1a4;
    }

    /* 模拟位置散落 */
    &.p1 {
      left: 8px;
      top: 12px;
    }
    &.p2 {
      left: 64px;
      top: 8px;
    }
    &.p3 {
      left: 106px;
      top: 22px;
    }
    &.p4 {
      left: 124px;
      top: 5px;
    }
    &.p5 {
      left: 5px;
      top: 58px;
    }
    &.p6 {
      left: 100px;
      top: 50px;
    }
    &.p7 {
      left: 154px;
      top: 64px;
    }
    &.p8 {
      left: 32px;
      top: 96px;
    }
    &.p9 {
      left: 74px;
      top: 88px;
    }
    &.p10 {
      left: 124px;
      top: 104px;
    }
  }
}

/* 占位空态样式 */
.placeholder-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;

  .warn-icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 12px;
  }

  .place-title {
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    margin-bottom: 4px;
  }

  .place-desc {
    font-size: 11px;
    color: #94a3b8;
  }
}

/* 优秀作答生成列表（已评定） */
.outstanding-answers-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.excellent-card {
  background-color: #f6fcf9;
  border: 1px solid #d1fae5;
  border-radius: 12px;
  padding: 12px;

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .avatar-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      color: #ffffff;

      &.excellent {
        background-color: #10b981;
      }
      &.good {
        background-color: #529b85;
      }
      &.pass {
        background-color: #84baa8;
      }
    }

    .name {
      font-size: 13px;
      font-weight: bold;
      color: #1e293b;
    }
  }

  .answer-text {
    margin: 0;
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
    text-align: justify;
  }
}

/* ==================== 中间大栏 ==================== */
.center-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* 图一：未出题 */
.question-generator-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);

  .prompt-title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: bold;
    color: #1e293b;
  }

  .prompt-subtitle {
    margin: 0 0 16px;
    font-size: 12px;
    color: #94a3b8;
  }

  .method-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

/* 图二：已出题状态下题目内容展示条 */
.question-display-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
  transition: all 0.2s ease-in-out;

  .question-stem {
    margin: 0;
    font-size: 14px;
    color: #334155;
    line-height: 1.6;
    flex: 1;
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

    .arrow {
      font-size: 8px;
      transition: transform 0.2s;
      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

/* 学生答题列表 */
.student-answers-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;

    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #334155;
    }

    .section-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.answers-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.student-answer-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  .card-left-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 60px;

    .student-name {
      font-size: 14px;
      font-weight: bold;
      color: #1e293b;
    }

    .status-badge {
      font-size: 10px;
      font-weight: bold;
      padding: 2px 0;
      border-radius: 6px;
      text-align: center;

      &.pending {
        background-color: #f1f5f9;
        color: #94a3b8;
      }
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
    }
  }

  .transcribed-text {
    flex: 1;
    margin: 0;
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    text-align: justify;
    padding-right: 12px;
  }

  .btn-play-audio {
    background-color: #f0f7f5;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
      background-color: #e2f2ed;
    }

    .play-arrow {
      display: inline-block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent #529b85;
      margin-left: 2px;
    }
  }
}

/* ==================== 右侧侧边数据看板 ==================== */
.right-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 基础指标行 */
.stats-row {
  display: flex;
  gap: 8px;

  .stat-card {
    flex: 1;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 14px 6px;
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
      border-color: #d1eae2;
      .num.highlight {
        color: #529b85;
      }
    }
  }
}

/* 评分设置展开面板 (图二) */
.collapse-item {
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 0;

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .label-title {
      font-size: 13px;
      font-weight: bold;
      color: #334155;
    }

    .action-link {
      font-size: 11px;
      color: #529b85;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 4px;

      .arrow {
        font-size: 8px;
        color: #cbd5e1;
      }
    }
  }
}

/* 评分分布区 */
.distribution-section {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-title {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #334155;
    border-left: 3px solid #529b85;
    padding-left: 8px;
  }
}

/* 空态分布占位 */
.chart-placeholder {
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 12px;

  .bar-chart-mini {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 24px;

    .bar {
      width: 4px;
      border-radius: 2px;
      background-color: #cbd5e1;

      &.b1 {
        height: 12px;
      }
      &.b2 {
        height: 22px;
      }
      &.b3 {
        height: 16px;
      }
    }
  }

  .placeholder-text {
    margin: 0;
    font-size: 11px;
  }
}

/* 评分真实柱形分布列表 */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;

  .dist-label {
    width: 36px;
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
      color: #cbd5e1;
    }
  }

  .progress-track {
    flex: 1;
    background-color: #f8fafc;
    border-radius: 6px;
    height: 14px;
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
    width: 36px;

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

/* AI评分警告与完成面板组合样式 */
.ai-status-panel {
  margin-top: auto; /* 推至侧栏底部 */
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .status-icon-box {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }

  /* 图 1 未出题态 */
  &.warning-mode {
    background-color: #f8fafc;
    .status-icon-box {
      background-color: #e2e8f0;
      color: #64748b;
    }
  }

  /* 图 2 已出题态 */
  &.success-mode {
    background-color: #f0f7f5;
    .status-icon-box {
      background-color: #e1f2ed;
      color: #529b85;
    }
  }

  .ai-info {
    .ai-title {
      font-size: 13px;
      font-weight: bold;
      color: #334155;
      margin-bottom: 2px;
    }

    .ai-desc {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* ==================== 3. 底部固定控制栏 ==================== */
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
  gap: 10px;
}

/* 按钮规范 */
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

  &-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-sparkle,
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
