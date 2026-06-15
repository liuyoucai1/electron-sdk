<template>
  <AnswerDistributionList
    :distributions="distributions"
    :get-status="getStatus"
    :expanded-label="expandedLabel"
    :student-list-map="studentListMap"
    :legend-items="legendItems"
    :compact="compact"
    subtitle="设置答案后显示正误"
    @toggle-student-list="$emit('toggle-student-list', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import AnswerDistributionList from "../../../components/distribution/AnswerDistributionList.vue";

const props = defineProps({
  distributions: {
    type: Array,
    default: () => [],
  },
  getStatus: {
    type: Function,
    required: true,
  },
  expandedLabel: {
    type: String,
    default: null,
  },
  studentListMap: {
    type: Object,
    default: () => ({}),
  },
  hasAnswerSet: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-student-list"]);

const legendItems = computed(() =>
  props.hasAnswerSet
    ? [
        { status: "correct", label: "正确选项" },
        { status: "wrong", label: "错误选项" },
        { status: "unanswered", label: "未作答" },
      ]
    : [],
);
</script>
