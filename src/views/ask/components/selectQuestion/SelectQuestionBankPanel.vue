<template>
  <div class="select-question-sidebar">
    <div class="tab-toggle-container">
      <button
        type="button"
        class="tab-sub-btn"
        :class="{ active: bankSubTab === 'chapter' }"
        @click="bankSubTab = 'chapter'"
      >
        章节选题
      </button>
      <button
        type="button"
        class="tab-sub-btn"
        :class="{ active: bankSubTab === 'knowledge' }"
        @click="bankSubTab = 'knowledge'"
      >
        知识点选题
      </button>
    </div>

    <div v-if="bankSubTab === 'chapter'" class="select-wrapper">
      <span class="filter-label">选教材</span>
      <el-select v-model="selectedBankBook" size="large">
        <el-option label="初二上册 · 人教部编版" value="biology8" />
        <el-option label="初二下册 · 人教统编版" value="english8" />
      </el-select>
    </div>

    <el-tree
      class="select-question-tree"
      :data="currentTreeData"
      node-key="id"
      :props="treeProps"
      :current-node-key="currentNodeKey"
      :default-expanded-keys="defaultExpandedKeys"
      highlight-current
      @node-click="handleTreeNodeClick"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  bankChapterTreeData,
  bankKnowledgeTreeData,
  selectQuestionTreeProps,
} from '../../../../mock/selectQuestion.js';

const treeProps = selectQuestionTreeProps;
const bankSubTab = ref('chapter');
const selectedBankBook = ref('biology8');
const currentNodeKey = ref('bk-cell-structure');
const defaultExpandedKeys = ref(['bk-cell']);

const currentTreeData = computed(() =>
  bankSubTab.value === 'chapter' ? bankChapterTreeData : bankKnowledgeTreeData,
);

// 切换章节 / 知识点选题时重置树选中与展开状态。
watch(bankSubTab, (mode) => {
  if (mode === 'chapter') {
    currentNodeKey.value = 'bk-cell-structure';
    defaultExpandedKeys.value = ['bk-cell'];
    return;
  }

  currentNodeKey.value = 'kn-cell';
  defaultExpandedKeys.value = ['kn-bio'];
});

// 记录题库目录树当前选中节点。
function handleTreeNodeClick(node) {
  currentNodeKey.value = node.id;
}
</script>

<style scoped lang="scss">
.select-question-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  flex: 1;
}

.tab-toggle-container {
  display: flex;
  background-color: var(--ez-n150);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
}

.tab-sub-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--ez-n600);
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: var(--ez-p500);
    color: #ffffff;
  }
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;

  .filter-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--ez-n400);
  }
}

.select-question-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: transparent;

  :deep(.el-tree-node__content) {
    height: 40px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n700);
  }

  :deep(.el-tree-node__content:hover) {
    background-color: var(--ez-n50);
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: var(--ez-p50);
    color: var(--ez-p600);
  }

  :deep(.el-tree-node__children .el-tree-node__content) {
    height: 36px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ez-n600);
  }

  :deep(.el-tree-node__children .el-tree-node.is-current > .el-tree-node__content) {
    color: var(--ez-p600);
    font-weight: 700;
  }

  :deep(.el-tree-node__expand-icon) {
    color: var(--ez-n400);
    font-size: 12px;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__expand-icon) {
    color: var(--ez-p600);
  }
}
</style>
