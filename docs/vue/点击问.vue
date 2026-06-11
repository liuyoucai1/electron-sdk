<template>
  <div class="page-container">
    <div class="content-card">
      <!-- 页面头部 -->
      <div class="card-header">
        <h2 class="title">发起提问</h2>
        <p class="subtitle">选择题型，向全班发起实时作答</p>
      </div>

      <!-- 页面主体 -->
      <div class="card-body">
        <!-- 即兴提问模块 -->
        <div class="section">
          <h3 class="section-title">即兴提问</h3>

          <!-- 客观题卡片 -->
          <div class="question-card objective-card">
            <div class="card-header-inner">
              <span class="card-label">客观题</span>
              <button class="btn-multi-question" @click="handleMultiQuestion">
                <!-- 拼图/多题图例小图标 -->
                <svg
                  class="icon-grid"
                  viewBox="0 0 1024 1024"
                  width="14"
                  height="14"
                >
                  <path
                    d="M416 128H192a64 64 0 0 0-64 64v224a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64z m0 288H192V192h224v224zM832 128H608a64 64 0 0 0-64 64v224a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64z m0 288H608V192h224v224zM416 544H192a64 64 0 0 0-64 64v224a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V608a64 64 0 0 0-64-64z m0 288H192V608h224v224zM832 544H608a64 64 0 0 0-64 64v224a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V608a64 64 0 0 0-64-64z m0 288H608V608h224v224z"
                    fill="currentColor"
                  ></path>
                </svg>
                多题提问
                <span class="arrow">></span>
              </button>
            </div>

            <div class="buttons-grid">
              <button class="btn-teal" @click="handleImpromptu('单选')">
                单选
              </button>
              <button class="btn-teal" @click="handleImpromptu('多选')">
                多选
              </button>
              <button class="btn-teal" @click="handleImpromptu('判断')">
                判断
              </button>
              <button class="btn-teal" @click="handleImpromptu('数值')">
                数值
              </button>
            </div>

            <!-- 选项个数计数器 -->
            <div class="counter-row">
              <span class="counter-label">单/多选选项个数</span>
              <div class="custom-counter">
                <button class="counter-btn" @click="decreaseOptions">—</button>
                <span class="counter-value">{{ optionCount }}</span>
                <button class="counter-btn" @click="increaseOptions">+</button>
              </div>
            </div>
          </div>

          <!-- 主观题卡片 -->
          <div class="question-card subjective-card">
            <div class="card-header-inner">
              <span class="card-label">主观题</span>
            </div>
            <div class="buttons-grid">
              <button class="btn-teal" @click="handleImpromptu('背诵')">
                背诵
              </button>
              <button class="btn-teal" @click="handleImpromptu('朗读')">
                朗读
              </button>
              <button class="btn-teal" @click="handleImpromptu('语音')">
                语音
              </button>
              <button class="btn-teal" @click="handleImpromptu('拍照')">
                拍照
              </button>
            </div>
          </div>
        </div>

        <!-- 选题提问模块 -->
        <div class="section">
          <h3 class="section-title">选题提问</h3>
          <div class="select-questions-grid">
            <!-- 自编 -->
            <div
              class="select-card theme-orange"
              @click="handleSelectMode('自编')"
            >
              <div class="card-icon-wrapper">
                <svg class="card-icon" viewBox="0 0 1024 1024">
                  <path
                    d="M736 128H288a96 96 0 0 0-96 96v576a96 96 0 0 0 96 96h448a96 96 0 0 0 96-96V224a96 96 0 0 0-96-96z m32 672a32 32 0 0 1-32 32H288a32 32 0 0 1-32-32V224a32 32 0 0 1 32-32h448a32 32 0 0 1 32 32z m-160-448H352a32 32 0 0 1 0-64h256a32 32 0 0 1 0 64z m0 128H352a32 32 0 0 1 0-64h256a32 32 0 0 1 0 64z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div class="card-info">
                <span class="main-title">自编</span>
                <span class="sub-title">我创建的题目</span>
              </div>
              <span class="arrow-right">></span>
            </div>

            <!-- 共享 -->
            <div
              class="select-card theme-green"
              @click="handleSelectMode('共享')"
            >
              <div class="card-icon-wrapper">
                <svg class="card-icon" viewBox="0 0 1024 1024">
                  <path
                    d="M736 512a128 128 0 1 0-128 128 128 128 0 0 0 128-128z m-192 0a64 64 0 1 1 64 64 64 64 0 0 1-64-64zM256 320a96 96 0 1 0-96-96 96 96 0 0 0 96 96zM800 672a96 96 0 1 0 96 96 96 96 0 0 0-96-96zM320 384l224 96M704 544l128 64"
                    stroke="currentColor"
                    stroke-width="48"
                    fill="none"
                    stroke-linecap="round"
                  ></path>
                </svg>
              </div>
              <div class="card-info">
                <span class="main-title">共享</span>
                <span class="sub-title">他人分享的题目</span>
              </div>
              <span class="arrow-right">></span>
            </div>

            <!-- 教材 -->
            <div
              class="select-card theme-blue"
              @click="handleSelectMode('教材')"
            >
              <div class="card-icon-wrapper">
                <svg class="card-icon" viewBox="0 0 1024 1024">
                  <path
                    d="M800 128H224a64 64 0 0 0-64 64v640a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zM224 832V192h576v640z m416-512H320a32 32 0 0 1 0-64h320a32 32 0 0 1 0 64z m0 192H320a32 32 0 0 1 0-64h320a32 32 0 0 1 0 64z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div class="card-info">
                <span class="main-title">教材</span>
                <span class="sub-title">配套教材题目</span>
              </div>
              <span class="arrow-right">></span>
            </div>

            <!-- 题库 -->
            <div
              class="select-card theme-purple"
              @click="handleSelectMode('题库')"
            >
              <div class="card-icon-wrapper">
                <svg class="card-icon" viewBox="0 0 1024 1024">
                  <path
                    d="M800 224H544l-64-64H224a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V288a64 64 0 0 0-64-64zM224 768V224h288l64 64h224v480zM512 416a32 32 0 0 1 32 32v64h64a32 32 0 0 1 0 64h-64v64a32 32 0 0 1-64 0v-64h-64a32 32 0 0 1 0-64h64v-64a32 32 0 0 1 32-32z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div class="card-info">
                <span class="main-title">题库</span>
                <span class="sub-title">系统题库</span>
              </div>
              <span class="arrow-right">></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 单/多选选项个数默认值
const optionCount = ref(4);

// 减少选项个数
const decreaseOptions = () => {
  if (optionCount.value > 2) {
    optionCount.value--;
  }
};

// 增加选项个数
const increaseOptions = () => {
  if (optionCount.value < 10) {
    optionCount.value++;
  }
};

/**
 * 客观/主观即兴提问事件
 * @param {string} type 题目类型
 */
const handleImpromptu = (type) => {
  console.log(`发起即兴提问 -> 类型: ${type}, 选项限制: ${optionCount.value}`);
};

/**
 * 触发多题提问配置
 */
const handleMultiQuestion = () => {
  console.log("触发多题提问弹窗配置");
};

/**
 * 选题提问选项卡事件
 * @param {string} mode 模式 (自编/共享/教材/题库)
 */
const handleSelectMode = (mode) => {
  console.log(`切换到选题提问 -> 模块: ${mode}`);
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
  max-width: 800px;
  background-color: #ffffff;
  border-radius: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部页头 */
.card-header {
  padding: 32px 32px 16px;
  background: linear-gradient(180deg, #f4fbf9 0%, #ffffff 100%);

  .title {
    margin: 0 0 6px;
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
  }

  .subtitle {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
  }
}

/* 页面主体 */
.card-body {
  padding: 16px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 大板块结构 */
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 700;
    color: #94a3b8;
  }
}

/* 即兴提问卡片基础 */
.question-card {
  border-radius: 20px;
  padding: 20px 24px;
  box-sizing: border-box;

  &.objective-card {
    background-color: #ffffff;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
  }

  &.subjective-card {
    background-color: #f2f8f6;
  }
}

.card-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .card-label {
    font-size: 15px;
    font-weight: 700;
    color: #334155;
  }

  &.subjective-card .card-label {
    color: #529b85;
  }
}

/* 多题提问标签按钮 */
.btn-multi-question {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #529b85;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #f8fafc;
  }

  .icon-grid {
    color: #529b85;
  }

  .arrow {
    font-size: 10px;
    color: #cbd5e1;
  }
}

/* 提问操作按钮阵列 */
.buttons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.btn-teal {
  background-color: #529b85;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    transform 0.1s ease;
  box-shadow: 0 4px 10px rgba(82, 155, 133, 0.15);

  &:hover {
    opacity: 0.95;
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 计数器结构 */
.counter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;

  .counter-label {
    font-size: 13px;
    color: #64748b;
  }
}

.custom-counter {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  height: 32px;
  background-color: #ffffff;

  .counter-btn {
    background: transparent;
    border: none;
    width: 32px;
    height: 100%;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;

    &:hover {
      background-color: #f1f5f9;
    }
  }

  .counter-value {
    min-width: 36px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    height: 100%;
    line-height: 30px;
  }
}

/* 选题提问网格布局 */
.select-questions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.select-card {
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  position: relative;
  border: 1.5px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.02);
  }

  /* 主题配色渲染 */
  &.theme-orange {
    background-color: #fffbf7;
    border-color: #ffe8d6;
    .card-icon-wrapper {
      color: #f97316;
    }
    .arrow-right {
      color: #fdba74;
    }
  }

  &.theme-green {
    background-color: #f6fcf9;
    border-color: #d1fae5;
    .card-icon-wrapper {
      color: #10b981;
    }
    .arrow-right {
      color: #6ee7b7;
    }
  }

  &.theme-blue {
    background-color: #f5f9ff;
    border-color: #dbeafe;
    .card-icon-wrapper {
      color: #3b82f6;
    }
    .arrow-right {
      color: #93c5fd;
    }
  }

  &.theme-purple {
    background-color: #f9f9fb;
    border-color: #e2e8f0;
    .card-icon-wrapper {
      color: #64748b;
    }
    .arrow-right {
      color: #94a3b8;
    }
  }

  .card-icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    .card-icon {
      width: 24px;
      height: 24px;
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;

    .main-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .sub-title {
      font-size: 12px;
      color: #94a3b8;
    }
  }

  .arrow-right {
    margin-left: auto;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
