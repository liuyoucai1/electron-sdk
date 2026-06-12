<template>
  <section class="analysis-compact">
    <header>
      <p>答题分析</p>
      <strong>86%</strong>
    </header>

    <main>
      <article v-for="item in resultItems" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </main>
  </section>
</template>

<script setup>
defineProps({
  sessionId: {
    type: String,
    default: ''
  },
  questionId: {
    type: String,
    default: ''
  },
  step: {
    type: String,
    default: ''
  }
});

const resultItems = [
  { label: '已答人数', value: '42' },
  { label: '平均用时', value: '38 秒' },
  { label: '待讲评', value: 'B' }
];
</script>

<style scoped lang="scss">
.analysis-compact {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  padding: 24px;
  background: #ffffff;
}

header {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 28px 0 32px;
  border-radius: 8px;
  background: var(--ez-p50);

  p {
    margin: 0;
    color: var(--ez-p600);
    font-size: 20px;
    font-weight: 700;
  }

  strong {
    color: var(--ez-p700);
    font-size: 64px;
    letter-spacing: 0;
    line-height: 1;
  }
}

main {
  display: grid;
  gap: 12px;
  align-content: start;
  margin-top: 22px;
}

article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  padding: 0 18px;
  border-radius: 8px;
  background: var(--ez-n50);

  span {
    color: var(--ez-n600);
    font-size: 17px;
  }

  strong {
    color: var(--ez-n950);
    font-size: 21px;
    letter-spacing: 0;
  }
}
</style>
