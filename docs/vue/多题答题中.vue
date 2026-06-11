<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <!-- 纯CSS绘制的问题标签 -->
        <div class="logo-badge">问</div>
        <div class="header-text">
          <span class="status-title">答题中</span>
          <span class="question-index">第1题</span>
          <span class="type-badge">单选</span>
        </div>
      </div>
    </div>

    <!-- 2. 主体内容区域 -->
    <div class="page-content">
      <!-- 左侧：题目展示看板 -->
      <div class="left-canvas-panel">
        <h2 class="question-text">下列关于细胞的说法正确的是（ ）</h2>
      </div>

      <!-- 右侧：实时答题进度侧边栏 -->
      <div class="right-sidebar">
        <!-- 计时器与完成度 -->
        <div class="monitor-header">
          <div class="time-box">
            <div class="timer-desc">
              <!-- 纯CSS时钟小图标 -->
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

        <!-- 组合进度条 (绿色：已完成，橙色：修改中，灰色：未提交) -->
        <div class="split-progress-bar">
          <div class="segment segment-completed" style="width: 60%"></div>
          <div class="segment segment-modifying" style="width: 13.3%"></div>
          <div class="segment segment-unsubmitted" style="width: 26.7%"></div>
        </div>

        <!-- 辅助分类统计指示 -->
        <div class="legend-row">
          <span class="legend-item text-orange">
            <span class="dot dot-orange"></span> 修改中 4
          </span>
          <span class="legend-item text-grey">
            <span class="dot dot-grey"></span> 未提交 6
          </span>
        </div>

        <!-- 学生即时状态网格 -->
        <div class="students-status-grid">
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
      </div>
    </div>

    <!-- 3. 底部固定控制栏 -->
    <div class="page-footer">
      <div class="footer-actions">
        <button class="btn btn-primary" @click="handleNextQuestion">
          下一题
        </button>
        <button class="btn btn-close-icon" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 计时器变量，高保真模拟秒表计时
const elapsedSeconds = ref(2);
const timerStr = ref("00:02");
let intervalId = null;

// 学生答题状态名单模拟
const modifyingStudents = ref(["张三", "李四", "王五", "赵六"]);
const unsubmittedStudents = ref([
  "小红",
  "小刚",
  "小颖",
  "小华",
  "小美",
  "周伟",
]);

// 启动计时器
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
 * 切换至下一题事件
 */
const handleNextQuestion = () => {
  console.log("保存本题结果，加载下一题数据");
};

/**
 * 取消并关闭当前答题流程
 */
const handleClose = () => {
  console.log("退出作答监控流程");
};
</script>

<style scoped lang="scss">
.full-screen-container {
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 1. 顶部页头 */
.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 24px;
  display: flex;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-badge {
    background-color: #529b85;
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .header-text {
    display: flex;
    align-items: center;
    gap: 10px;

    .status-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }

    .question-index {
      font-size: 14px;
      color: #529b85;
      font-weight: bold;
    }

    .type-badge {
      background-color: #f1f5f9;
      color: #94a3b8;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
}

/* 2. 主体布局区域 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧：题目看板 */
.left-canvas-panel {
  flex: 1;
  background-color: #fafaf7; /* 米白色护眼纸张质感背景 */
  padding: 48px;
  overflow-y: auto;

  .question-text {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #1e293b;
    line-height: 1.6;
  }
}

/* 右侧：答题状态监控栏 */
.right-sidebar {
  width: 350px;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 进度与时钟组 */
.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;

  .time-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .timer-desc {
      font-size: 12px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;

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
    gap: 4px;

    .ratio-num {
      line-height: 1;
      .current {
        font-size: 24px;
        font-weight: bold;
        color: #529b85;
      }
      .total {
        font-size: 14px;
        color: #94a3b8;
      }
    }

    .ratio-label {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* 分段组合进度条 */
.split-progress-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f1f5f9;
  margin-bottom: 16px;

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

/* 图例分类行 */
.legend-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .legend-item {
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.text-orange {
      color: #f97316;
      .dot-orange {
        background-color: #f97316;
      }
    }
    &.text-grey {
      color: #94a3b8;
      .dot-grey {
        background-color: #cbd5e1;
      }
    }
  }
}

/* 学生即时网格 */
.students-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
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

  /* 修改中（橙色）风格 */
  &.badge-modifying {
    background-color: #fffaf7;
    border: 1px solid #fed7aa;
    color: #f97316;
  }

  /* 未提交（灰色）风格 */
  &.badge-unsubmitted {
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    color: #64748b;
  }
}

/* 3. 底部固定控制栏 */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

  &-primary {
    background-color: #529b85;
    color: white;
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 44px;
    padding: 0;
  }
}
</style>
