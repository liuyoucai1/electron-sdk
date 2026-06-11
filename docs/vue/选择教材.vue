<template>
  <el-dialog
    v-model="visible"
    width="640px"
    align-center
    class="select-textbook-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="title">选择教材</div>
        <div class="subtitle">请选择年级、学期和教材版本</div>
      </div>
    </template>

    <!-- 选择板块 -->
    <div class="dialog-body">
      <!-- 年级 -->
      <div class="section">
        <div class="section-title">年级</div>
        <div class="grid-buttons grade-grid">
          <button
            v-for="g in grades"
            :key="g"
            class="tag-btn"
            :class="{ active: currentGrade === g }"
            @click="currentGrade = g"
          >
            {{ g }}
          </button>
        </div>
      </div>

      <!-- 学期 -->
      <div class="section">
        <div class="section-title">学期</div>
        <div class="grid-buttons semester-grid">
          <button
            v-for="s in semesters"
            :key="s"
            class="tag-btn"
            :class="{ active: currentSemester === s }"
            @click="currentSemester = s"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- 教材版本 -->
      <div class="section">
        <div class="section-title">教材版本</div>
        <div class="grid-buttons edition-grid">
          <button
            v-for="e in editions"
            :key="e"
            class="tag-btn"
            :class="{ active: currentEdition === e }"
            @click="currentEdition = e"
          >
            {{ e }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button class="btn btn-confirm" @click="handleConfirm">确定</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 数据项定义
const grades = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
];
const semesters = ["上册", "下册"];
const editions = ["人教部编版", "沪教版", "苏教版", "北师大版", "外研版"];

// 默认值（对应截图高亮）
const currentGrade = ref("初二");
const currentSemester = ref("上册");
const currentEdition = ref("人教部编版");

const handleCancel = () => {
  visible.value = false;
};

const handleConfirm = () => {
  const result = {
    grade: currentGrade.value,
    semester: currentSemester.value,
    edition: currentEdition.value,
  };
  console.log("确定选择教材:", result);
  emit("confirm", result);
  visible.value = false;
};
</script>

<style scoped lang="scss">
.select-textbook-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    padding: 24px;
  }
}

.dialog-header {
  text-align: left;
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: #94a3b8;
  }
}

.dialog-body {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #475569;
    margin-bottom: 10px;
  }
}

.grid-buttons {
  display: grid;
  gap: 10px;

  &.grade-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  &.semester-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  &.edition-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tag-btn {
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  height: 40px;
  font-size: 13px;
  font-weight: bold;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  &.active {
    border-color: #529b85;
    background-color: #f0f7f5;
    color: #529b85;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  border-radius: 12px;
  padding: 8px 24px;
  height: 40px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: none;

  &-cancel {
    background-color: white;
    border: 1px solid #cbd5e1;
    color: #64748b;
  }

  &-confirm {
    background-color: #529b85;
    color: white;
  }
}
</style>
