<template>
  <div class="distribution-section" :class="{ 'is-compact': compact }">
    <div class="section-header">
      <span class="section-title">作答分布</span>
      <span class="section-subtitle">点击选项查看作答学生</span>
    </div>

    <div class="distribution-list">
      <div
        v-for="dist in distributions"
        :key="dist.label"
        class="dist-item"
      >
        <div class="dist-row" @click="$emit('toggle-student-list', dist.label)">
          <span
            class="dist-badge"
            :class="`dist-badge--${dist.status}`"
          >{{ dist.label }}</span>
          <div class="progress-track">
            <div
              class="progress-bar"
              :class="`progress-bar--${dist.status}`"
              :style="{ width: dist.percent + '%' }"
            ></div>
          </div>
          <div class="dist-meta">
            <span class="count">{{ dist.count }}人</span>
            <span class="percent">{{ dist.percent }}%</span>
          </div>
          <span
            class="arrow-down"
            :class="{ expanded: expandedLabel === dist.label }"
          >▼</span>
        </div>

        <transition name="student-list-fade">
          <div
            v-if="expandedLabel === dist.label"
            class="student-list-panel"
          >
            <span
              v-for="name in studentListMap[dist.label] || []"
              :key="name"
              class="student-tag"
            >
              {{ name }}
            </span>
          </div>
        </transition>
      </div>
    </div>

    <div class="info-tip">
      <span class="info-icon">ⓘ</span>
      点击选项可以查看作答学生名单
    </div>
  </div>
</template>

<script setup>
defineProps({
  distributions: {
    type: Array,
    default: () => [],
  },
  expandedLabel: {
    type: String,
    default: null,
  },
  studentListMap: {
    type: Object,
    default: () => ({}),
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-student-list"]);
</script>

<style scoped lang="scss">
.distribution-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;

  &.is-compact {
    gap: 16px;
    flex: none;
    padding-bottom: 8px;
  }
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-left: 3px solid var(--ez-p500);
  padding-left: 8px;

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n800);
  }

  .section-subtitle {
    font-size: 11px;
    color: var(--ez-n400);
  }
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.is-compact .distribution-list {
  gap: 8px;
}

.dist-item {
  display: flex;
  flex-direction: column;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  padding: 6px 0;
  border-radius: 6px;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--ez-n50);
  }
}

.dist-badge {
  flex-shrink: 0;
  min-width: 44px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;

  &--excellent {
    background-color: #e6fcf1;
    color: #10b981;
  }

  &--good {
    background-color: var(--ez-p50);
    color: var(--ez-p600);
  }

  &--pass {
    background-color: #eef8f6;
    color: #84baa8;
  }

  &--needs-improvement {
    background-color: #fef2f2;
    color: var(--ez-error);
  }

  &--unanswered {
    background-color: var(--ez-n150);
    color: var(--ez-n500);
  }
}

.progress-track {
  flex: 1;
  background-color: var(--ez-n100);
  border-radius: 8px;
  height: 32px;
  overflow: hidden;
}

.is-compact .progress-track {
  height: 28px;
}

.progress-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;

  &--excellent {
    background-color: #10b981;
  }

  &--good {
    background-color: var(--ez-p500);
  }

  &--pass {
    background-color: #84baa8;
  }

  &--needs-improvement {
    background-color: var(--ez-error);
  }

  &--unanswered {
    background-color: var(--ez-n300);
  }
}

.dist-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 44px;

  .count {
    font-size: 12px;
    font-weight: 700;
    color: var(--ez-n800);
  }

  .percent {
    font-size: 10px;
    color: var(--ez-n400);
  }
}

.arrow-down {
  font-size: 8px;
  color: var(--ez-n300);
  transition: transform 0.2s;

  &.expanded {
    transform: rotate(180deg);
  }
}

.student-list-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  padding: 12px 0 12px 54px;
}

.student-tag {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid var(--ez-n200);
  border-radius: 6px;
  font-size: 11px;
  color: var(--ez-n700);
  background-color: #ffffff;
}

.info-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ez-n400);
}

.is-compact .info-tip {
  display: none;
}

.student-list-fade-enter-active,
.student-list-fade-leave-active {
  transition: all 0.2s ease;
}

.student-list-fade-enter-from,
.student-list-fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
</style>
