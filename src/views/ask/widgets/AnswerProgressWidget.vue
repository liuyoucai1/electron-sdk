<template>
  <section class="answer-progress">
    <!-- 顶部数据看板区（兼拖拽手柄） -->
    <div class="monitor-header" data-drag-handle>
      <div class="time-box">
        <div class="timer-desc">
          <span class="icon-clock"></span>
          已用时间
        </div>
        <div class="timer-display">{{ timerStr }}</div>
      </div>

      <div class="progress-ratio">
        <span class="ratio-num">
          <span class="current">18</span><span class="total">/30</span>
        </span>
        <span class="ratio-label">已完成人数</span>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar-container">
      <div class="split-progress-bar">
        <div
          class="segment segment-completed"
          :style="{ width: completedPct + '%' }"
        ></div>
        <div
          class="segment segment-modifying"
          :style="{ width: modifyingPct + '%' }"
        ></div>
        <div
          class="segment segment-unsubmitted"
          :style="{ width: unsubmittedPct + '%' }"
        ></div>
      </div>
    </div>

    <!-- 收起/展开切换条 -->
    <div class="toggle-bar">
      <div class="legend-info">
        <span class="legend-item text-orange">
          <span class="dot dot-orange"></span> 修改中
          {{ modifyingStudents.length }}
        </span>
        <span class="legend-item text-grey">
          <span class="dot dot-grey"></span> 未提交
          {{ unsubmittedStudents.length }}
        </span>
      </div>

      <button class="btn-toggle-grid" type="button" @click="toggleCollapse">
        {{ collapsed ? "展开" : "收起" }}
        <span class="toggle-arrow" :class="{ up: !collapsed }">▲</span>
      </button>
    </div>

    <!-- 中部学生网格（带展开收起过渡） -->
    <transition name="fade-slide">
      <div v-if="!collapsed" class="monitor-body">
        <div class="students-status-grid">
          <div
            v-for="name in modifyingStudents"
            :key="name"
            class="student-badge badge-modifying"
          >
            {{ name }}
          </div>
          <div
            v-for="name in unsubmittedStudents"
            :key="name"
            class="student-badge badge-unsubmitted"
          >
            {{ name }}
          </div>
        </div>
      </div>
    </transition>

    <!-- 底部操作栏：始终可见 -->
    <div class="monitor-footer">
      <button class="btn btn-coral" type="button" @click="handleEnd">
        结束答题
      </button>
      <button class="btn btn-close-icon" type="button" @click="handleClose">
        ✕
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  sessionId: { type: String, default: "" },
  questionType: { type: [Number, String], default: "" },
  optionCount: { type: Number, default: 4 },
  entrySource: { type: String, default: "" },
});

const emit = defineEmits(["flow-action"]);

// 收起/展开状态。默认收起，初始以 200 高度打开。
const collapsed = ref(true);

const COLLAPSED_HEIGHT = 160;
const EXPANDED_HEIGHT = 500;

function toggleCollapse() {
  collapsed.value = !collapsed.value;

  emit("flow-action", {
    action: collapsed.value ? "collapse-small-page" : "expand-small-page",
    collapsedHeight: COLLAPSED_HEIGHT,
    expandedHeight: EXPANDED_HEIGHT,
  });
}

// 学生网格可见状态（已合并到 collapse 逻辑中，保留 isGridVisible 兼容）。
const isGridVisible = ref(true);

// 模拟学生名单。
const modifyingStudents = ref(["张三", "李四", "王五", "赵六", "孙七", "小明"]);
const unsubmittedStudents = ref([
  "小红",
  "小刚",
  "小颖",
  "小华",
  "小美",
  "周伟",
]);

// 进度百分比。
const totalStudents = computed(
  () => modifyingStudents.value.length + unsubmittedStudents.value.length + 18,
);
const completedPct = computed(() =>
  Math.round((18 / totalStudents.value) * 100),
);
const modifyingPct = computed(() =>
  Math.round((modifyingStudents.value.length / totalStudents.value) * 100),
);
const unsubmittedPct = computed(
  () => 100 - completedPct.value - modifyingPct.value,
);

// 计时器。
const elapsedSeconds = ref(2);
const timerStr = ref("00:02");
let intervalId = null;

function startTimer() {
  intervalId = setInterval(() => {
    elapsedSeconds.value++;
    const m = Math.floor(elapsedSeconds.value / 60)
      .toString()
      .padStart(2, "0");
    const s = (elapsedSeconds.value % 60).toString().padStart(2, "0");
    timerStr.value = `${m}:${s}`;
  }, 1000);
}

onMounted(() => startTimer());

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});

// 结束答题，交给流程 store 决定跳转目标。
function handleEnd() {
  emit("flow-action", { action: "finish-answering" });
}

// 关闭答题进程，断链回到 idle。
function handleClose() {
  emit("flow-action", { action: "close-flow" });
}
</script>

<style scoped lang="scss">
.answer-progress {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  user-select: none;
}

/* ========== 顶部数据看板 ========== */
.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 16px 8px;
  background: #f7faf9;
  cursor: grab;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
}

.time-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timer-desc {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
}

/* CSS 时钟图标 */
.icon-clock {
  display: inline-block;
  width: 11px;
  height: 11px;
  border: 1.5px solid #94a3b8;
  border-radius: 50%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 4px;
    width: 1px;
    height: 3px;
    background-color: #94a3b8;
  }

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 2px;
    height: 1px;
    background-color: #94a3b8;
  }
}

.timer-display {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  letter-spacing: 0;
}

.progress-ratio {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  .ratio-num {
    line-height: 1;

    .current {
      font-size: 18px;
      font-weight: 800;
      color: #529b85;
    }

    .total {
      font-size: 11px;
      color: #94a3b8;
    }
  }

  .ratio-label {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
  }
}

/* ========== 进度条 ========== */
.progress-bar-container {
  padding: 0 16px 8px;
  background: #f7faf9;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.split-progress-bar {
  display: flex;
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  background: #e2e8f0;

  .segment {
    height: 100%;
    transition: width 0.3s ease;

    &-completed {
      background: #529b85;
    }

    &-modifying {
      background: #f97316;
    }

    &-unsubmitted {
      background: #cbd5e1;
    }
  }
}

/* ========== 切换条（legend + toggle） ========== */
.toggle-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  flex-shrink: 0;
}

.legend-info {
  display: flex;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #78716c;

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  &.text-orange .dot-orange {
    background: #f97316;
  }

  &.text-grey .dot-grey {
    background: #cbd5e1;
  }
}

.btn-toggle-grid {
  display: flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  color: #529b85;
  cursor: pointer;

  .toggle-arrow {
    font-size: 5px;
    transition: transform 0.2s;
    transform: rotate(180deg);

    &.up {
      transform: rotate(0deg);
    }
  }
}

/* ========== 中部学生网格区 ========== */
.monitor-body {
  flex: 1;
  padding: 0 16px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.students-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  align-content: start;
}

.student-badge {
  display: grid;
  place-items: center;
  height: 28px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;

  &.badge-modifying {
    background: #fffaf7;
    border: 1px solid #fed7aa;
    color: #f97316;
  }

  &.badge-unsubmitted {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    color: #64748b;
  }
}

/* 展开收起过渡 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-in-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ========== 底部操作栏 ========== */
.monitor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px 14px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-coral {
    height: 34px;
    padding: 0 18px;
    border-radius: 10px;
    background: #db7373;
    color: #ffffff;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(219, 115, 115, 0.15);
  }

  &-close-icon {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 10px;
    background: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    font-size: 13px;
  }
}
</style>
