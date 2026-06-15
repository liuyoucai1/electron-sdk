<template>
  <section class="ask-entry">
    <!-- 页面头部 -->
    <header class="card-header">
      <h2 class="title">发起提问</h2>
      <p class="subtitle">选择题型，向全班发起实时作答</p>
    </header>

    <!-- 页面主体 -->
    <div class="card-body">
      <!-- 即兴提问模块 -->
      <div class="section">
        <h3 class="section-title">即兴提问</h3>

        <!-- 客观题卡片 -->
        <div class="question-card objective-card">
          <div class="card-header-inner">
            <span class="card-label">客观题</span>
            <button class="btn-multi-question" type="button" @click="handleMultiQuestion">
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
              <span class="arrow">&gt;</span>
            </button>
          </div>

          <div class="buttons-grid">
            <button class="btn-teal" type="button" @click="handleImpromptu('单选')">
              单选
            </button>
            <button class="btn-teal" type="button" @click="handleImpromptu('多选')">
              多选
            </button>
            <button class="btn-teal" type="button" @click="handleImpromptu('判断')">
              判断
            </button>
            <button class="btn-teal" type="button" @click="handleImpromptu('数值')">
              数值
            </button>
          </div>

          <!-- 选项个数计数器 -->
          <div class="counter-row">
            <span class="counter-label">单/多选选项个数</span>
            <div class="custom-counter">
              <button class="counter-btn" type="button" @click="decreaseOptions">—</button>
              <span class="counter-value">{{ optionCount }}</span>
              <button class="counter-btn" type="button" @click="increaseOptions">+</button>
            </div>
          </div>
        </div>

        <!-- 主观题卡片 -->
        <div class="question-card subjective-card">
          <div class="card-header-inner">
            <span class="card-label">主观题</span>
          </div>
          <div class="buttons-grid">
            <button class="btn-teal" type="button" @click="handleImpromptu('背诵')">
              背诵
            </button>
            <button class="btn-teal" type="button" @click="handleImpromptu('朗读')">
              朗读
            </button>
            <button class="btn-teal" type="button" @click="handleImpromptu('语音')">
              语音
            </button>
            <button class="btn-teal is-disabled" type="button" disabled>
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
          <div class="select-card theme-orange" @click="handleSelectMode('自编')">
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
            <span class="arrow-right">&gt;</span>
          </div>

          <!-- 共享 -->
          <div class="select-card theme-green" @click="handleSelectMode('共享')">
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
            <span class="arrow-right">&gt;</span>
          </div>

          <!-- 教材 -->
          <div class="select-card theme-blue" @click="handleSelectMode('教材')">
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
            <span class="arrow-right">&gt;</span>
          </div>

          <!-- 题库 -->
          <div class="select-card theme-purple" @click="handleSelectMode('题库')">
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
            <span class="arrow-right">&gt;</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { SELECT_QUESTION_ENTRY_TABS } from '../../../mock/selectQuestion.js';

const emit = defineEmits(['flow-action']);

// 单/多选选项个数，默认 4，范围 2-10。
const optionCount = ref(4);

// 减少选项个数，下限 2。
function decreaseOptions() {
  if (optionCount.value > 2) {
    optionCount.value--;
  }
}

// 增加选项个数，上限 10。
function increaseOptions() {
  if (optionCount.value < 10) {
    optionCount.value++;
  }
}

// 客观/主观题即兴提问，根据类型映射到对应流程动作。
function handleImpromptu(type) {
  if (['单选', '多选', '判断', '数值'].includes(type)) {
    const questionTypeMap = {
      '单选': 2,
      '多选': 3,
      '判断': 4,
      '数值': 20
    };

    emit('flow-action', {
      action: 'open-answer-progress',
      entrySource: 'ask-entry',
      questionId: `question-${Date.now()}`,
      questionType: questionTypeMap[type],
      optionCount: optionCount.value
    });
    return;
  }

  // 主观题：背诵 / 朗读 → 背读流程；语音 → 出题方式小屏。
  if (type === '语音') {
    emit('flow-action', { action: 'open-voice-question' });
    return;
  }

  const reciteTypeMap = {
    '背诵': 'recite',
    '朗读': 'read',
  };

  emit('flow-action', {
    action: 'open-read-recite',
    reciteType: reciteTypeMap[type] || 'text'
  });
}

// 打开多题提问小屏。
function handleMultiQuestion() {
  emit('flow-action', { action: 'open-multi-question' });
}

// 打开选题提问小屏，并根据入口定位到对应 Tab。
function handleSelectMode(mode) {
  emit('flow-action', {
    action: 'open-select-question',
    initialTab: SELECT_QUESTION_ENTRY_TABS[mode] || 'self',
  });
}
</script>

<style scoped lang="scss">
.ask-entry {
  display: flex;
  flex-direction: column;
  height: 640px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
}

/* 顶部页头 */
.card-header {
  padding: 28px 28px 0;
  background: linear-gradient(180deg, var(--ez-p50) 0%, #ffffff 100%);

  .title {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 800;
    color: var(--ez-n950);
    letter-spacing: 0;
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--ez-n400);
  }
}

/* 页面主体 */
.card-body {
  flex: 1;
  padding: 12px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
}

/* 大板块结构 */
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .section-title {
    margin: 0 0 2px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n400);
  }
}

/* 即兴提问卡片基础 */
.question-card {
  border-radius: 16px;
  padding: 16px 20px;

  &.objective-card {
    background-color: #ffffff;
    border: 1px solid var(--ez-n150);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }

  &.subjective-card {
    background-color: var(--ez-p50);
  }
}

.card-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .card-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n800);
  }

  .subjective-card & .card-label {
    color: var(--ez-p600);
  }
}

/* 多题提问标签按钮 */
.btn-multi-question {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--ez-n200);
  border-radius: 8px;
  background: #ffffff;
  color: var(--ez-p600);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background-color: var(--ez-n50);
  }

  .icon-grid {
    color: var(--ez-p600);
  }

  .arrow {
    font-size: 10px;
    color: var(--ez-n300);
  }
}

/* 提问操作按钮阵列 */
.buttons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.btn-teal {
  display: grid;
  place-items: center;
  height: 48px;
  border: none;
  border-radius: 14px;
  background-color: var(--ez-p500);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 100ms ease;
  box-shadow: 0 4px 10px rgba(91, 159, 138, 0.18);

  &:hover {
    background-color: var(--ez-p600);
  }

  &:active {
    transform: scale(0.97);
  }

  &.is-disabled,
  &:disabled {
    background-color: var(--ez-n200);
    color: var(--ez-n400);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;

    &:hover {
      background-color: var(--ez-n200);
    }
  }
}

/* 计数器结构 */
.counter-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;

  .counter-label {
    font-size: 12px;
    color: var(--ez-n600);
  }
}

.custom-counter {
  display: flex;
  align-items: center;
  height: 30px;
  border: 1px solid var(--ez-n200);
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;

  .counter-btn {
    display: grid;
    place-items: center;
    width: 30px;
    height: 100%;
    border: none;
    background: transparent;
    color: var(--ez-n600);
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background-color: var(--ez-n50);
    }
  }

  .counter-value {
    display: grid;
    place-items: center;
    min-width: 34px;
    height: 100%;
    border-left: 1px solid var(--ez-n200);
    border-right: 1px solid var(--ez-n200);
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n950);
  }
}

/* 选题提问网格布局 */
.select-questions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.select-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--ez-shadow-2);
  }

  /* 主题配色 */
  &.theme-orange {
    background-color: #fffbf7;
    border-color: #ffe8d6;
    .card-icon-wrapper { color: #f97316; }
    .arrow-right { color: #fdba74; }
  }

  &.theme-green {
    background-color: #f6fcf9;
    border-color: #d1fae5;
    .card-icon-wrapper { color: #10b981; }
    .arrow-right { color: #6ee7b7; }
  }

  &.theme-blue {
    background-color: #f5f9ff;
    border-color: #dbeafe;
    .card-icon-wrapper { color: #3b82f6; }
    .arrow-right { color: #93c5fd; }
  }

  &.theme-purple {
    background-color: #f9f9fb;
    border-color: var(--ez-n200);
    .card-icon-wrapper { color: var(--ez-n600); }
    .arrow-right { color: var(--ez-n400); }
  }

  .card-icon-wrapper {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    margin-right: 12px;

    .card-icon {
      width: 22px;
      height: 22px;
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;

    .main-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ez-n950);
      margin-bottom: 2px;
    }

    .sub-title {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }

  .arrow-right {
    margin-left: auto;
    font-size: 13px;
    font-weight: 700;
  }
}
</style>
