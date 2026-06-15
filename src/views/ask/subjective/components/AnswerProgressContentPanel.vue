<template>
  <section class="answer-progress-content">
    <div v-if="contentType === 'image'" class="image-content-wrapper">
      <img
        v-if="imageSrc"
        class="question-image"
        :src="imageSrc"
        :alt="title"
      />
      <div v-else class="content-empty">暂无题目图片</div>
    </div>

    <div v-else-if="contentType === 'objective'" class="objective-content-wrapper">
      <p class="objective-stem">{{ objectiveStem }}</p>
    </div>

    <template v-else>
      <div v-if="deferQuestionSetup" class="content-deferred-placeholder">
        <p class="placeholder-title">暂无题目内容</p>
        <p class="placeholder-desc">学生正在语音作答，结束后可在分析页设置题目</p>
      </div>

      <div v-else-if="isContentVisible" class="html-content-wrapper">
        <h1 v-if="title" class="content-title">{{ title }}</h1>
        <div class="content-html" v-html="contentHtml"></div>
      </div>

      <div v-else class="content-hidden-placeholder">
        <span class="placeholder-icon" aria-hidden="true">👁️‍🗨️</span>
        <p class="placeholder-text">{{ hiddenPlaceholder }}</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  contentType: {
    type: String,
    default: "html",
  },
  title: {
    type: String,
    default: "",
  },
  contentHtml: {
    type: String,
    default: "",
  },
  imageSrc: {
    type: String,
    default: "",
  },
  isContentVisible: {
    type: Boolean,
    default: true,
  },
  deferQuestionSetup: {
    type: Boolean,
    default: false,
  },
  modeLabel: {
    type: String,
    default: "答题",
  },
  objectiveStem: {
    type: String,
    default: "",
  },
});

const hiddenPlaceholder = computed(
  () => `原文已隐藏，学生正在进行闭卷${props.modeLabel}`,
);
</script>

<style scoped lang="scss">
.answer-progress-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.image-content-wrapper,
.html-content-wrapper {
  flex: 1;
  min-height: 0;
}

.image-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.question-image {
  display: block;
  max-width: 100%;
  width: auto;
  height: auto;
  max-height: calc(100vh - 180px);
  object-fit: contain;
  border-radius: 12px;
  box-shadow: var(--ez-shadow-2);
  background: #ffffff;
}

.content-empty {
  color: var(--ez-n400);
  font-size: 16px;
  font-weight: 700;
}

.objective-content-wrapper {
  flex: 1;
  min-height: 0;
  max-width: 850px;
}

.objective-stem {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--ez-n900);
  line-height: 1.8;
  white-space: pre-line;
}

.html-content-wrapper {
  max-width: 850px;
}

.content-title {
  margin: 0 0 40px;
  font-size: 26px;
  font-weight: 800;
  color: var(--ez-n900);
}

.content-html {
  font-size: 20px;
  color: var(--ez-n800);
  line-height: 1.8;

  :deep(p) {
    margin: 0 0 32px;
    text-align: justify;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }
}

.content-hidden-placeholder,
.content-deferred-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ez-n400);
}

.content-deferred-placeholder {
  .placeholder-title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 800;
    color: var(--ez-n800);
  }

  .placeholder-desc {
    margin: 0;
    font-size: 14px;
    color: var(--ez-n500);
  }
}

.content-hidden-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ez-n400);

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .placeholder-text {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
}
</style>
