<template>
  <div class="select-question-sidebar">
    <div class="select-wrapper">
      <span class="filter-label">选教材</span>
      <el-select v-model="selectedTextbook" size="large">
        <el-option label="初二下册英语人教统编版" value="english8" />
        <el-option label="初二上册生物人教部编版" value="biology8" />
      </el-select>
    </div>

    <el-tree
      class="select-question-tree"
      :data="textbookChapterTreeData"
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
import { ref } from 'vue';
import {
  selectQuestionTreeProps,
  textbookChapterTreeData,
} from '../../../../mock/selectQuestion.js';

const treeProps = selectQuestionTreeProps;
const selectedTextbook = ref('english8');
const currentNodeKey = ref('tb-1-1');
const defaultExpandedKeys = ['tb-unit1'];

// 记录教材目录树当前选中节点。
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
