<template>
  <div class="full-screen-container">
    <!-- 1. 主体内容区域 -->
    <div class="page-content">
      <!-- 左侧：原文展示区（支持切换隐藏/显示） -->
      <div class="left-text-panel">
        <div v-if="isTextVisible" class="text-content-wrapper">
          <h1 class="text-title">我的理想</h1>

          <p class="text-paragraph">
            每个人都有自己的理想，我的理想是成为一名优秀的教师...
          </p>

          <p class="text-paragraph">
            每个人都有自己的理想，我的理想是成为一名优秀的教师。从小我就对教师这个职业充满了向往，因为老师不仅传授知识，更是学生人生道路上的引路人。
          </p>

          <p class="text-paragraph">
            我想成为一名教师，是因为我喜欢和孩子们在一起的感觉。看着他们天真无邪的笑脸，听着他们银铃般的笑声，我的心里就充满了快乐。我希望能够用自己的知识和经验，帮助他们健康快乐地成长，成为对社会有用的人才。
          </p>
        </div>

        <!-- 隐藏课文时的占位提示 -->
        <div v-else class="text-hidden-placeholder">
          <span class="placeholder-icon">👁️‍🗨️</span>
          <p class="placeholder-text">原文已隐藏，学生正在进行闭卷背诵</p>
        </div>
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
          <div class="segment segment-modifying" style="width: 20%"></div>
          <div class="segment segment-unsubmitted" style="width: 20%"></div>
        </div>

        <!-- 辅助分类统计指示 -->
        <div class="legend-row">
          <span class="legend-item text-orange">
            <span class="dot dot-orange"></span> 修改中 6
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

    <!-- 2. 底部固定控制栏 -->
    <div class="page-footer">
      <div class="footer-actions">
        <!-- 隐藏/显示原文切换按钮 -->
        <button class="btn btn-outline-green" @click="toggleTextVisibility">
          {{ isTextVisible ? "隐藏原文" : "显示原文" }}
        </button>
        <!-- 结束答题按钮（粉红/珊瑚红色调） -->
        <button class="btn btn-coral" @click="handleEndRecitation">
          结束答题
        </button>

        <div class="divider-line"></div>

        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close-icon" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 原文可见性状态
const isTextVisible = ref(true);

// 计时器变量，高保真模拟秒表计时
const elapsedSeconds = ref(2);
const timerStr = ref("00:02");
let intervalId = null;

// 学生答题状态名单模拟
const modifyingStudents = ref(["张三", "李四", "王五", "赵六", "孙七", "小明"]);
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

// 切换显示/隐藏课文原文
const toggleTextVisibility = () => {
  isTextVisible.value = !isTextVisible.value;
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
const handleEndRecitation = () => {
  console.log("教师主动结束本篇课文背诵，统计最终数据");
};

/**
 * 最小化窗口
 */
const handleMinimize = () => {
  console.log("最小化答题窗口");
};

/**
 * 退出背诵监控流
 */
const handleClose = () => {
  console.log("退出背诵流程并返回");
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

/* 1. 主体内容区域 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧原文展示面板 */
.left-text-panel {
  flex: 1;
  background-color: #fafaf8; /* 纸张米黄色保护色 */
  padding: 56px 64px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .text-content-wrapper {
    max-width: 850px;
  }

  .text-title {
    margin: 0 0 40px;
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
  }

  .text-paragraph {
    margin: 0 0 32px;
    font-size: 20px;
    color: #334155;
    line-height: 1.8;
    text-align: justify;
  }
}

/* 隐藏原文时的占位样式 */
.text-hidden-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .placeholder-text {
    font-size: 16px;
    font-weight: bold;
  }
}

/* 右侧答题进度监控栏 */
.right-sidebar {
  width: 350px;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 进度与时钟信息组 */
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

/* 学生即时状态网格 */
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

/* 2. 底部固定操作栏 */
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

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

/* 按钮体系 */
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

  /* 隐藏原文按钮（绿色边框，圆润无填充） */
  &-outline-green {
    background-color: white;
    border: 1.5px solid #529b85;
    color: #529b85;
  }

  /* 结束答题按钮（粉珊瑚红） */
  &-coral {
    background-color: #db7373;
    color: white;
  }

  &-icon {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    width: 38px;
    padding: 0;
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
