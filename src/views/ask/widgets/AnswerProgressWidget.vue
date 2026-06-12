<template>
  <section class="answer-progress">
    <div>
      <p>答题进行中</p>
      <strong>{{ optionCount }} 个选项</strong>
    </div>
    <button type="button" @click="finishAnswering">结束答题</button>
  </section>
</template>

<script setup>
defineProps({
  sessionId: {
    type: String,
    default: ''
  },
  questionType: {
    type: String,
    default: ''
  },
  optionCount: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['flow-action']);

// 结束当前答题并进入全屏分析页。
function finishAnswering() {
  emit('flow-action', { action: 'finish-answering' });
}
</script>

<style scoped lang="scss">
.answer-progress {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14px;
  height: 100%;
  padding: 24px;
  background: #ffffff;

  p {
    margin: 0 0 8px;
    color: var(--ez-n600);
    font-size: 15px;
  }

  strong {
    color: var(--ez-n950);
    font-size: 24px;
    letter-spacing: 0;
  }

  button {
    min-width: 104px;
    height: 48px;
    border-radius: 14px;
    background: var(--ez-p500);
    color: #ffffff;
  }
}
</style>
