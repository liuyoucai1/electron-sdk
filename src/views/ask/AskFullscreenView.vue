<template>
  <section class="ask-fullscreen">
    <header class="fullscreen-toolbar">
      <div>
        <p>问</p>
        <h1>答题分析</h1>
      </div>

      <div class="toolbar-actions">
        <button type="button" @click="shrinkToCompact">缩放</button>
        <button type="button" class="is-danger" @click="closeFlow">关闭</button>
      </div>
    </header>

    <main class="analysis-board">
      <section class="summary-panel">
        <span>正确率</span>
        <strong>86%</strong>
      </section>

      <section class="detail-panel">
        <h2>答题结果</h2>
        <div class="result-row" v-for="item in resultItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { useAskFullscreenControls } from './composables/useAskFullscreenControls';

const { closeAskFlow, shrinkToCompact: shrinkCurrentToCompact } = useAskFullscreenControls();
const resultItems = [
  { label: '已答人数', value: '42' },
  { label: '平均用时', value: '38 秒' },
  { label: '待讲评选项', value: 'B' }
];

// 从全屏分析页缩放为 400 x 800 缩屏。
async function shrinkToCompact() {
  await shrinkCurrentToCompact();
}

// 关闭全屏分析页并回到胶囊页面。
async function closeFlow() {
  await closeAskFlow();
}
</script>

<style scoped lang="scss">
.ask-fullscreen {
  min-height: 100vh;
  padding: 36px 44px;
  background: var(--ez-n100);
}

.fullscreen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;

  p {
    margin: 0 0 8px;
    color: var(--ez-p600);
    font-size: 22px;
    font-weight: 700;
  }

  h1 {
    margin: 0;
    color: var(--ez-n950);
    font-size: 44px;
    letter-spacing: 0;
  }
}

.toolbar-actions {
  display: flex;
  gap: 14px;

  button {
    min-width: 112px;
    height: 56px;
    border: 1px solid var(--ez-p300);
    border-radius: 16px;
    background: #ffffff;
    color: var(--ez-p600);
    font-size: 18px;
    font-weight: 700;

    &.is-danger {
      border-color: #efc4be;
      background: #fdf2f1;
      color: var(--ez-error);
    }
  }
}

.analysis-board {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  margin-top: 32px;
}

.summary-panel,
.detail-panel {
  border-radius: 8px;
  background: #ffffff;
  box-shadow: var(--ez-shadow-2);
}

.summary-panel {
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 620px;
  gap: 16px;

  span {
    color: var(--ez-n600);
    font-size: 24px;
  }

  strong {
    color: var(--ez-p600);
    font-size: 92px;
    letter-spacing: 0;
  }
}

.detail-panel {
  padding: 32px;

  h2 {
    margin: 0 0 24px;
    color: var(--ez-n950);
    font-size: 30px;
    letter-spacing: 0;
  }
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 84px;
  padding: 0 24px;
  border-radius: 8px;
  background: var(--ez-n50);

  & + & {
    margin-top: 14px;
  }

  span {
    color: var(--ez-n700);
    font-size: 20px;
  }

  strong {
    color: var(--ez-n950);
    font-size: 26px;
    letter-spacing: 0;
  }
}
</style>
