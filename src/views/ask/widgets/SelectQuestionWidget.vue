<template>
  <section class="wide-small-page">
    <header>
      <div>
        <p>问</p>
        <h2>选题提问</h2>
      </div>
      <button type="button" @click="closeFlow">关闭</button>
    </header>

    <main>
      <article v-for="question in questions" :key="question.id">
        <strong>{{ question.title }}</strong>
        <span>{{ question.type }}</span>
      </article>
    </main>
  </section>
</template>

<script setup>
defineProps({
  source: {
    type: String,
    default: 'question-bank'
  }
});

const emit = defineEmits(['flow-action']);
const questions = [
  { id: 1, title: '课堂即时反馈', type: '单选' },
  { id: 2, title: '知识点巩固', type: '多选' },
  { id: 3, title: '易错题回顾', type: '判断' }
];

// 关闭选题提问普通小屏。
function closeFlow() {
  emit('flow-action', { action: 'close-flow' });
}
</script>

<style scoped lang="scss">
.wide-small-page {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 710px;
  padding: 30px;
  background: #ffffff;

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

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

  button {
    min-width: 76px;
    height: 44px;
    border: 1px solid var(--ez-p200);
    border-radius: 12px;
    background: #ffffff;
    color: var(--ez-p600);
  }

  main {
    display: grid;
    gap: 14px;
    align-content: center;
    margin-top: 26px;
  }

  article {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 88px;
    padding: 0 24px;
    border-radius: 8px;
    background: var(--ez-n50);
    color: var(--ez-n900);
  }

  strong {
    font-size: 22px;
    letter-spacing: 0;
  }

  span {
    color: var(--ez-p600);
    font-weight: 700;
  }
}
</style>
