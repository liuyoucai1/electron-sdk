<template>
  <section class="ask-entry">
    <header class="entry-header">
      <div>
        <p>问</p>
        <h2>发起提问</h2>
      </div>
      <button type="button" class="ghost-button" @click="closeFlow">关闭</button>
    </header>

    <main class="entry-body">
      <button type="button" class="action-card is-primary" @click="openAnswerProgress">
        <strong>单题提问</strong>
        <span>开始课堂答题</span>
      </button>
      <button type="button" class="action-card" @click="openMultiQuestion">
        <strong>多题提问</strong>
        <span>连续选择多道题</span>
      </button>
      <button type="button" class="action-card" @click="openReadRecite">
        <strong>背读</strong>
        <span>进入背读任务</span>
      </button>
      <button type="button" class="action-card" @click="openSelectQuestion">
        <strong>选题提问</strong>
        <span>从题库中选择</span>
      </button>
    </main>
  </section>
</template>

<script setup>
const emit = defineEmits(['flow-action']);

// 关闭问业务入口，交给流程 store 清理链路。
function closeFlow() {
  emit('flow-action', { action: 'close-flow' });
}

// 进入答题进行中普通小屏。
function openAnswerProgress() {
  emit('flow-action', {
    action: 'open-answer-progress',
    questionId: `question-${Date.now()}`,
    questionType: 'single-choice',
    optionCount: 4
  });
}

// 打开多题提问普通小屏。
function openMultiQuestion() {
  emit('flow-action', { action: 'open-multi-question' });
}

// 打开背读普通小屏。
function openReadRecite() {
  emit('flow-action', {
    action: 'open-read-recite',
    reciteType: 'text'
  });
}

// 打开选题提问普通小屏。
function openSelectQuestion() {
  emit('flow-action', {
    action: 'open-select-question',
    source: 'question-bank'
  });
}
</script>

<style scoped lang="scss">
.ask-entry {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 650px;
  padding: 28px;
  background: #ffffff;
}

.entry-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  p {
    margin: 0 0 8px;
    color: var(--ez-p600);
    font-size: 18px;
    font-weight: 700;
  }

  h2 {
    margin: 0;
    color: var(--ez-n950);
    font-size: 30px;
    letter-spacing: 0;
  }
}

.entry-body {
  display: grid;
  gap: 14px;
  align-content: center;
  margin-top: 28px;
}

.ghost-button {
  min-width: 76px;
  height: 44px;
  border: 1px solid var(--ez-p200);
  border-radius: 12px;
  background: #ffffff;
  color: var(--ez-p600);
}

.action-card {
  display: grid;
  gap: 6px;
  justify-items: start;
  min-height: 92px;
  padding: 20px 22px;
  border: 1px solid var(--ez-n150);
  border-radius: 8px;
  background: var(--ez-n50);
  color: var(--ez-n900);
  text-align: left;

  strong {
    font-size: 22px;
    letter-spacing: 0;
  }

  span {
    color: var(--ez-n600);
    font-size: 15px;
    letter-spacing: 0;
  }

  &.is-primary {
    border-color: var(--ez-p300);
    background: var(--ez-p50);
  }
}
</style>
