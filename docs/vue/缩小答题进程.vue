<template>
  <div class="route-container">
    <div class="monitor-card">
      <!-- 1. 顶部数据看板区 -->
      <div class="monitor-header">
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
          <div class="segment segment-completed" style="width: 60%"></div>
          <div class="segment segment-modifying" style="width: 20%"></div>
          <div class="segment segment-unsubmitted" style="width: 20%"></div>
        </div>
      </div>

      <!-- 2. 中部控制与学生状态网格 -->
      <div class="monitor-body">
        <div class="control-row">
          <div class="legend-info">
            <span class="legend-item text-orange">
              <span class="dot dot-orange"></span> 修改中 6
            </span>
            <span class="legend-item text-grey">
              <span class="dot dot-grey"></span> 未提交 6
            </span>
          </div>

          <!-- 收起/展开切换 -->
          <button
            class="btn-toggle-grid"
            @click="isGridVisible = !isGridVisible"
          >
            {{ isGridVisible ? "收起" : "展开" }}
            <span class="arrow-arrow" :class="{ up: isGridVisible }">▲</span>
          </button>
        </div>

        <!-- 学生卡片网格（带平滑展开收起过渡） -->
        <transition name="fade-slide">
          <div v-show="isGridVisible" class="students-status-grid">
            <!-- 修改中学生（橙色高亮） -->
            <div
              v-for="name in modifyingStudents"
              :key="name"
              class="student-badge badge-modifying"
            >
              {{ name }}
            </div>

            <!-- 未提交学生（灰色） -->
            <div
              v-for="name in unsubmittedStudents"
              :key="name"
              class="student-badge badge-unsubmitted"
            >
              {{ name }}
            </div>
          </div>
        </transition>
      </div>

      <!-- 3. 底部操作栏 -->
      <div class="monitor-footer">
        <!-- 结束答题（珊瑚红颜色） -->
        <button class="btn btn-coral" @click="handleEnd">结束答题</button>
        <!-- 关闭/取消按钮 -->
        <button class="btn btn-close-icon" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 监控网格可见状态
const isGridVisible = ref(true);

// 计时器变量，高保真模拟秒表计时
const elapsedSeconds = ref(2);
const timerStr = ref("00:02");
let intervalId = null;

// 学生名单模拟
const modifyingStudents = ref(["张三", "李四", "王五", "赵六", "孙七", "小明"]);
const unsubmittedStudents = ref([
  "小红",
  "小刚",
  "小颖",
  "小华",
  "小美",
  "周伟",
]);

// 启动计时
const startTimer = () => {
  intervalId = setInterval(() => {
    elapsedSeconds.value++;
    const minutes = Math.floor(elapsedSeconds.value / 60);
    const seconds = elapsedSeconds.value % 60;

    const minStr = minutes.toString().padStart(2, "0");
    const secStr = seconds.toString().padStart(2, "0");

    timerStr.value = `${minStr}:${secStr}`;
  }, 1000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

/**
 * 结束答题事件
 */
const handleEnd = () => {
  console.log("教师主动结束本篇阅读/背诵流程");
};

/**
 * 关闭当前卡片式页面
 */
const handleClose = () => {
  console.log("关闭答题监控");
};
</script>

<style scoped lang="scss">
.route-container {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

/* 卡片式精简面板容器 */
.monitor-card {
  width: 100%;
  max-width: 380px; /* 限制精简面板宽度比例 */
  background-color: #ffffff;
  border-radius: 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部数据看板区（浅色背景） */
.monitor-header {
  background-color: #f7faf9;
  padding: 24px 20px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .time-box {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .timer-desc {
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: bold;

      .icon-clock {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1.5px solid #94a3b8;
        border-radius: 50%;
        position: relative;

        &::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 5px;
          width: 1px;
          height: 4px;
          background-color: #94a3b8;
        }
        &::before {
          content: "";
          position: absolute;
          top: 5px;
          left: 5px;
          width: 3px;
          height: 1px;
          background-color: #94a3b8;
        }
      }
    }

    .timer-display {
      font-size: 26px;
      font-weight: bold;
      color: #1e293b;
      line-height: 1;
    }
  }

  .progress-ratio {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    .ratio-num {
      line-height: 1;
      .current {
        font-size: 24px;
        font-weight: bold;
        color: #529b85;
      }
      .total {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .ratio-label {
      font-size: 11px;
      color: #94a3b8;
      font-weight: bold;
    }
  }
}

/* 进度条外壳（带顶底内边距） */
.progress-bar-container {
  background-color: #f7faf9;
  padding: 0 20px 20px;
  border-bottom: 1.5px solid #f1f5f9;
}

/* 分段组合进度条 */
.split-progress-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background-color: #e2e8f0;

  .segment {
    height: 100%;
    transition: width 0.3s ease;

    &-completed {
      background-color: #529b85;
    }
    &-modifying {
      background-color: #f97316;
    }
    &-unsubmitted {
      background-color: #cbd5e1;
    }
  }
}

/* 中部监控信息体 */
.monitor-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .legend-info {
    display: flex;
    gap: 12px;
  }

  .legend-item {
    font-size: 11px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 4px;

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }

    &.text-orange {
      color: #78716c;
      .dot-orange {
        background-color: #f97316;
      }
    }
    &.text-grey {
      color: #78716c;
      .dot-grey {
        background-color: #cbd5e1;
      }
    }
  }
}

/* 收起/展开触发钮 */
.btn-toggle-grid {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: bold;
  color: #529b85;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  .arrow-arrow {
    font-size: 6px;
    transition: transform 0.2s;
    transform: rotate(180deg); // 展开向下

    &.up {
      transform: rotate(0deg); // 收起向上
    }
  }
}

/* 学生即时状态卡片网格 */
.students-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.student-badge {
  height: 36px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  /* 修改中（橙色） */
  &.badge-modifying {
    background-color: #fffaf7;
    border: 1px solid #fed7aa;
    color: #f97316;
  }

  /* 未提交（灰色） */
  &.badge-unsubmitted {
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    color: #64748b;
  }
}

/* 3. 底部操作栏 */
.monitor-footer {
  padding: 16px 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 按钮规范 */
.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  /* 结束答题按钮（粉红色调） */
  &-coral {
    background-color: #db7373;
    color: white;
    box-shadow: 0 4px 12px rgba(219, 115, 115, 0.15);
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 44px;
    padding: 0;
  }
}

/* 展开收起动效过渡 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-in-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
