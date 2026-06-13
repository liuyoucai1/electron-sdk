<template>
  <section class="original-text-comparison">
    <div class="section-header">
      <h3 class="section-title">原文对照</h3>
      <div class="legend-row">
        <span class="legend-item">
          <span class="dot dot-correct" aria-hidden="true"></span>
          正确
        </span>
        <span class="legend-item">
          <span class="dot dot-error" aria-hidden="true"></span>
          错误
        </span>
        <span class="legend-item">
          <span class="dot dot-missed" aria-hidden="true"></span>
          漏读
        </span>
      </div>
    </div>

    <p class="comparison-text">
      <span
        v-for="(segment, index) in segments"
        :key="`${segment.type}-${index}`"
        class="comparison-segment"
        :class="`is-${segment.type}`"
      >
        {{ segment.text }}
      </span>
    </p>
  </section>
</template>

<script setup>
defineProps({
  segments: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped lang="scss">
.original-text-comparison {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--ez-n150);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .section-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--ez-n800);
  }
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ez-n500);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.dot-correct {
    background-color: var(--ez-success);
  }

  &.dot-error {
    background-color: var(--ez-error);
  }

  &.dot-missed {
    background-color: var(--ez-n300);
  }
}

.comparison-text {
  margin: 0;
  font-size: 20px;
  line-height: 1.8;
  font-weight: 700;
  text-align: justify;
}

.comparison-segment {
  &.is-correct {
    color: var(--ez-success);
  }

  &.is-error {
    color: var(--ez-error);
  }

  &.is-missed {
    color: var(--ez-n300);
  }
}
</style>
