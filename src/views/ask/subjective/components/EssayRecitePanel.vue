<template>
  <section class="center-content-panel is-full">
    <div class="content-header-title">精选满分作文</div>
    <div class="recitation-list">
      <button
        v-for="item in essayItems"
        :key="item.id"
        type="button"
        class="recitation-item"
        :class="{ active: selectedItemId === item.id }"
        @click="selectedItemId = item.id"
      >
        <span
          class="radio-indicator"
          :class="{ checked: selectedItemId === item.id }"
        ></span>
        <div class="item-body">
          <div class="item-title">{{ item.title }}</div>
          <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { getEssayParagraphs } from "../../../../mock/reciteParagraphs.js";

const essayItems = ref([
  {
    id: "my_ideal",
    title: "我的理想",
    desc: "每个人都有自己的理想，我的理想是成为一名优秀的教师...",
  },
  {
    id: "memorable_day",
    title: "难忘的一天",
    desc: "那是一个阳光明媚的早晨，我和家人一起去爬山...",
  },
  {
    id: "my_hometown",
    title: "我爱我的家乡",
    desc: "我的家乡是一个美丽的小镇，那里山清水秀...",
  },
]);

const selectedItemId = ref("my_ideal");
const selectedParagraphIds = ref([]);
const selectedParagraphs = ref([]);

// 返回按段落选择弹框所需的上下文。
function getParagraphSelectContext() {
  const item = essayItems.value.find(
    (entry) => entry.id === selectedItemId.value,
  );

  return {
    contentId: selectedItemId.value,
    title: item?.title || "",
    paragraphs: getEssayParagraphs(selectedItemId.value),
    selectedIds: [...selectedParagraphIds.value],
  };
}

// 保存按段落选择结果。
function setSelectedParagraphs(payload) {
  selectedParagraphIds.value = [...(payload.selectedIds || [])];
  selectedParagraphs.value = [...(payload.selectedParagraphs || [])];
}

// 返回当前满分作文 Tab 的提交载荷。
function getSubmitPayload() {
  const item = essayItems.value.find(
    (entry) => entry.id === selectedItemId.value,
  );

  return {
    tab: "essay",
    contentId: selectedItemId.value,
    contentTitle: item?.title || "",
    selectedParagraphIds: [...selectedParagraphIds.value],
    selectedParagraphs: [...selectedParagraphs.value],
  };
}

defineExpose({
  getSubmitPayload,
  getParagraphSelectContext,
  setSelectedParagraphs,
});
</script>

<style scoped lang="scss">
.center-content-panel.is-full {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .content-header-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ez-n400);
    margin-bottom: 16px;
  }
}

.recitation-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recitation-item {
  display: flex;
  align-items: flex-start;
  padding: 18px 24px;
  border: 1.5px solid var(--ez-n200);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  text-align: left;
  width: 100%;

  &:hover {
    background-color: var(--ez-n50);
  }

  &.active {
    border-color: var(--ez-p500);
    background-color: var(--ez-p50);
  }

  .radio-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ez-n300);
    border-radius: 50%;
    margin-right: 16px;
    margin-top: 2px;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;

    &.checked {
      border-color: var(--ez-p500);
      background-color: var(--ez-p500);

      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .item-body {
    flex: 1;
    min-width: 0;

    .item-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ez-n900);
      margin-bottom: 6px;
    }

    .item-desc {
      font-size: 13px;
      color: var(--ez-n400);
      line-height: 1.4;
    }
  }
}
</style>
