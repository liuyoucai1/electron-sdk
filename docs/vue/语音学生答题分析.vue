<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">语</div>
        <div class="header-text">
          <h1 class="title">学生答题详情</h1>
        </div>
      </div>
    </div>

    <!-- 2. 主体大区 -->
    <div class="page-content">
      <!-- 左侧：语音转文本与波形播放器 -->
      <div class="left-main-panel">
        <div class="panel-header-sub">题目内容</div>

        <div class="transcribe-container">
          <h3 class="section-title">| 马七 的语音作答 (转文本)</h3>
          <p class="transcribe-text">
            校园建设要注重无障碍设施，让每一位同学都能平等地参与学校生活。
          </p>
        </div>

        <!-- 底部波形播放器控制条 -->
        <div class="audio-player-bar">
          <!-- 播放计时 -->
          <span class="player-time">{{ formattedTime }} / 0:47</span>

          <!-- 模拟交互波形图 -->
          <div class="waveform-container">
            <span
              v-for="(height, index) in waveformHeights"
              :key="index"
              class="wave-bar"
              :class="{ active: isBarActive(index) }"
              :style="{ height: height + 'px' }"
            ></span>
          </div>

          <!-- 播放/暂停控制按钮 -->
          <button class="btn-player-control" @click="togglePlay">
            <!-- 播放态与暂停态切换 -->
            <span v-if="!isPlaying" class="play-icon"></span>
            <span v-else class="pause-icon"></span>
          </button>
        </div>
      </div>

      <!-- 右侧：学生评价与得分看板 -->
      <div class="right-sidebar">
        <!-- 学生基本评价 -->
        <div class="profile-header">
          <h2 class="student-name">马七</h2>
          <div class="eval-badge">
            <span class="label">综合评价</span>
            <span class="ai-tag">AI 生成</span>
          </div>
        </div>

        <!-- 综合得分等级卡片 -->
        <div class="grade-card">
          <div class="score-box">
            <span class="score-num">63</span>
            <span class="score-label">综合得分 / 100</span>
          </div>
          <div class="level-box">
            <span class="level-label">综合等级</span>
            <span class="level-badge">良好</span>
          </div>
        </div>

        <!-- 评语建议框 -->
        <div class="suggestions-card">
          <p class="suggestions-text">
            答案结构清晰，要点覆盖较全面，表达较为自然。建议在细节描述和语言丰富性上进一步提升。
          </p>
        </div>
      </div>
    </div>

    <!-- 3. 底部固定控制与切换栏 -->
    <div class="page-footer">
      <div class="footer-left"></div>
      <div class="footer-actions">
        <!-- 学生切换分页器 -->
        <div class="pagination-wrapper">
          <button class="btn-pagination" @click="changeStudent(-1)">
            &lt; 上一位
          </button>
          <span class="page-indicator">15 / 26</span>
          <button
            class="btn-pagination btn-next-active"
            @click="changeStudent(1)"
          >
            下一位 &gt;
          </button>
        </div>

        <div class="divider-line"></div>

        <button class="btn btn-outline" @click="handleBack">
          <svg
            class="icon-reply"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M494.933 243.2a32 32 0 0 1 45.245 45.245L356.565 469.333H800a32 32 0 0 1 0 64H356.565l183.616 180.885a32 32 0 1 1-45.245 45.245l-237.44-233.9a32 32 0 0 1 0-45.245l237.437-237.12z"
              fill="currentColor"
            ></path>
          </svg>
          返回
        </button>
        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close" @click="handleClose">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";

// 播放控制变量
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = 47;
let playInterval = null;

// 模拟36条不同高度的音频波形线段数据
const waveformHeights = [
  8, 12, 16, 24, 20, 16, 8, 12, 16, 12, 8, 20, 24, 28, 16, 12, 8, 16, 20, 24,
  16, 12, 8, 12, 20, 28, 24, 16, 12, 16, 20, 12, 8, 12, 16, 8,
];

// 播放/暂停动作
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    playInterval = setInterval(() => {
      if (currentTime.value < duration) {
        currentTime.value++;
      } else {
        clearInterval(playInterval);
        isPlaying.value = false;
        currentTime.value = 0;
      }
    }, 1000);
  } else {
    if (playInterval) {
      clearInterval(playInterval);
    }
  }
};

// 格式化当前秒数为分秒字符串 (e.g. 0:05)
const formattedTime = computed(() => {
  const m = Math.floor(currentTime.value / 60);
  const s = (currentTime.value % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});

// 计算单根波形条是否属于已播放进度区
const isBarActive = (index) => {
  const progressRatio = currentTime.value / duration;
  const barRatio = index / waveformHeights.length;
  return barRatio <= progressRatio;
};

onUnmounted(() => {
  if (playInterval) {
    clearInterval(playInterval);
  }
});

/**
 * 切换学生分页
 */
const changeStudent = (step) => {
  console.log(`切换学生，步长: ${step}`);
};

/**
 * 右侧控制行为
 */
const handleBack = () => {
  console.log("路由返回上一级");
};

const handleMinimize = () => {
  console.log("最小化学生详情面板");
};

const handleClose = () => {
  console.log("关闭当前面板");
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
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }
  }
}

/* 2. 主体大区 */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧原文与播放器区域 */
.left-main-panel {
  flex: 1;
  background-color: #fafaf8; /* 纸张米黄色背景 */
  padding: 24px 48px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header-sub {
    font-size: 13px;
    color: #94a3b8;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
}

.transcribe-container {
  flex: 1;

  .section-title {
    font-size: 15px;
    color: #529b85;
    font-weight: bold;
    margin-bottom: 24px;
  }

  .transcribe-text {
    margin: 0;
    font-size: 22px;
    color: #334155;
    line-height: 1.6;
    font-weight: bold;
  }
}

/* 底部波形播放器控制条 */
.audio-player-bar {
  height: 64px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;

  .player-time {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
    white-space: nowrap;
    width: 80px;
  }
}

/* 模拟波形图 */
.waveform-container {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.wave-bar {
  flex: 1;
  background-color: #e2e8f0; // 未播发灰色
  border-radius: 2px;
  transition:
    background-color 0.15s,
    height 0.15s;

  &.active {
    background-color: #529b85; // 已播发绿色
  }
}

/* 播放按钮 */
.btn-player-control {
  background-color: #529b85;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }

  /* 播放三角形图标 */
  .play-icon {
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 0 6px 10px;
    border-color: transparent transparent transparent #ffffff;
    margin-left: 2px;
  }

  /* 暂停双竖线图标 */
  .pause-icon {
    display: inline-block;
    width: 10px;
    height: 12px;
    border-left: 3px solid #ffffff;
    border-right: 3px solid #ffffff;
    box-sizing: border-box;
  }
}

/* 右侧侧边栏 */
.right-sidebar {
  width: 350px;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* 学生评价头 */
.profile-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .student-name {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
  }

  .eval-badge {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 12px;
      color: #94a3b8;
    }

    .ai-tag {
      background-color: #f1f5f9;
      color: #94a3b8;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

/* 综合得分等级卡片 */
.grade-card {
  background-color: #f0f7f5;
  border: 1px solid #d1eae2;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .score-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .score-num {
      font-size: 32px;
      font-weight: 800;
      color: #529b85;
      line-height: 1;
    }

    .score-label {
      font-size: 11px;
      color: #94a3b8;
    }
  }

  .level-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    .level-label {
      font-size: 11px;
      color: #94a3b8;
    }

    .level-badge {
      background-color: #529b85;
      color: #ffffff;
      font-size: 14px;
      font-weight: bold;
      padding: 4px 16px;
      border-radius: 10px;
    }
  }
}

/* 评语建议框 */
.suggestions-card {
  background-color: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  .suggestions-text {
    margin: 0;
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    text-align: justify;
  }
}

/* 3. 底部固定控制与切换栏 */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

/* 翻页器组件 */
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;

  .btn-pagination {
    background-color: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    height: 38px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: #cbd5e1;
    }

    /* 下一位（激活蓝色风格） */
    &.btn-next-active {
      background-color: #eff6ff;
      border-color: #bfdbfe;
      color: #3b82f6;

      &:hover {
        border-color: #93c5fd;
      }
    }
  }

  .page-indicator {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
  }
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

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

  &-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-reply {
      color: #64748b;
    }
  }

  &-icon {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    width: 38px;
    padding: 0;
  }

  &-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
