<template>
  <header class="answer-progress-page-header">
    <span class="brand-badge">问</span>
    <span class="status-text">{{ statusText }}</span>
  </header>
</template>

<script setup>
defineProps({
  statusText: {
    type: String,
    default: '答题中',
  },
});
</script>

<style scoped lang="scss">
.answer-progress-page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  background: var(--ez-p500);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
}

.status-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--ez-n700);
}
</style>
