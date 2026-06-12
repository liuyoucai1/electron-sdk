<template>
  <section class="wide-small-page">
    <header>
      <div>
        <p>问</p>
        <h2>背读</h2>
      </div>
      <button type="button" @click="closeFlow">关闭</button>
    </header>

    <main>
      <section class="content-panel">
        <h3>课文片段</h3>
        <p>春风吹过教室，学生跟随节奏完成朗读与背诵。</p>
      </section>
      <aside class="info-panel">
        <strong>{{ reciteTypeLabel }}</strong>
        <span>待开始</span>
      </aside>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  reciteType: {
    type: String,
    default: 'text'
  }
});

const emit = defineEmits(['flow-action']);
const reciteTypeLabel = computed(() => (props.reciteType === 'text' ? '文本背读' : '背读任务'));

// 关闭背读普通小屏。
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
    margin: 0;
    color: var(--ez-n600);
    font-size: 18px;
    line-height: 1.7;
  }

  header p {
    margin-bottom: 8px;
    color: var(--ez-p600);
    font-weight: 700;
  }

  h2,
  h3 {
    margin: 0;
    color: var(--ez-n950);
    letter-spacing: 0;
  }

  h2 {
    font-size: 30px;
  }

  h3 {
    margin-bottom: 18px;
    font-size: 24px;
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
    grid-template-columns: 1fr 260px;
    gap: 18px;
    margin-top: 26px;
  }
}

.content-panel,
.info-panel {
  border-radius: 8px;
  background: var(--ez-n50);
}

.content-panel {
  padding: 28px;
}

.info-panel {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12px;

  strong {
    color: var(--ez-n900);
    font-size: 26px;
    letter-spacing: 0;
  }

  span {
    color: var(--ez-p600);
  }
}
</style>
