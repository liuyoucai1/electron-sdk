<template>
  <section class="simple-small-page">
    <header>
      <div>
        <p>问</p>
        <h2>多题提问</h2>
      </div>
      <button type="button" @click="closeFlow">关闭</button>
    </header>

    <main>
      <article v-for="item in questionCards" :key="item">
        <strong>{{ item }}</strong>
        <span>待选择</span>
      </article>
    </main>
  </section>
</template>

<script setup>
const emit = defineEmits(['flow-action']);
const questionCards = ['第 1 题', '第 2 题', '第 3 题'];

// 关闭多题提问普通小屏。
function closeFlow() {
  emit('flow-action', { action: 'close-flow' });
}
</script>

<style scoped lang="scss">
.simple-small-page {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 460px;
  padding: 28px;
  background: #ffffff;

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  p {
    margin: 0 0 8px;
    color: var(--ez-p600);
    font-size: 17px;
    font-weight: 700;
  }

  h2 {
    margin: 0;
    color: var(--ez-n950);
    font-size: 28px;
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
    gap: 12px;
    align-content: center;
    margin-top: 24px;
  }

  article {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    padding: 0 18px;
    border-radius: 8px;
    background: var(--ez-n50);
    color: var(--ez-n900);
  }

  span {
    color: var(--ez-n500);
  }
}
</style>
