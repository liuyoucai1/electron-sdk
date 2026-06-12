<template>
  <div class="distribution-section" :class="{ 'is-compact': compact }">
    <div class="section-header">
      <span class="section-title">作答分布</span>
      <span class="section-subtitle">设置答案后显示正误</span>
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
            :class="`dist-badge--${getStatus(dist.label)}`"
          >{{ dist.label }}</span>
          <div class="progress-track">
            <div
              class="progress-bar"
              :class="`progress-bar--${getStatus(dist.label)}`"
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

    <div v-if="hasAnswerSet" class="distribution-legend">
      <span class="legend-item">
        <span class="dot dot-correct"></span>正确选项
      </span>
      <span class="legend-item">
        <span class="dot dot-wrong"></span>错误选项
      </span>
      <span class="legend-item">
        <span class="dot dot-unanswered"></span>未作答
      </span>
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
  getStatus: {
    type: Function,
    required: true,
  },
  expandedLabel: {
    type: String,
    default: null,
  },
  studentListMap: {
    type: Object,
    default: () => ({}),
  },
  hasAnswerSet: {
    type: Boolean,
    default: false,
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

  &.is-compact {
    gap: 16px;
    padding-bottom: 8px;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    border-left: 3px solid #529b85;
    padding-left: 8px;

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #334155;
    }

    .section-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
    background-color: #f8fafc;
  }
}

.dist-badge {
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  background-color: #f1f5f9;
  color: #64748b;

  &--default {
    background-color: #f1f5f9;
    color: #64748b;
  }

  &--correct {
    background-color: #529b85;
    color: #ffffff;
  }

  &--wrong {
    background-color: #fdf3f2;
    border: 1px solid #f0d4d2;
    color: #d9827b;
  }

  &--unanswered {
    min-width: auto;
    height: auto;
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: #334155;
    font-size: 13px;
  }
}

.progress-track {
  flex: 1;
  background-color: #f1f5f9;
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
  transition: width 0.3s;

  &--default {
    background-color: #b7dbd1;
  }

  &--correct {
    background-color: #529b85;
  }

  &--wrong {
    background-color: #d9827b;
  }

  &--unanswered {
    background-color: #cbd5e1;
  }
}

.dist-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 44px;

  .count {
    font-size: 12px;
    font-weight: bold;
    color: #334155;
  }

  .percent {
    font-size: 10px;
    color: #94a3b8;
  }
}

.arrow-down {
  font-size: 8px;
  color: #cbd5e1;
  transition: transform 0.2s;

  &.expanded {
    transform: rotate(180deg);
  }
}

.student-list-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  padding: 12px 0 12px 34px;
}

.student-tag {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  background-color: #ffffff;
}

.distribution-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 4px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #94a3b8;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.dot-correct {
      background-color: #529b85;
    }

    &.dot-wrong {
      background-color: #d9827b;
    }

    &.dot-unanswered {
      background-color: #cbd5e1;
    }
  }
}

.info-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;

  .info-icon {
    font-size: 12px;
  }
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
