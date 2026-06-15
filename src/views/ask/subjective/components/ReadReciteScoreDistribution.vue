<template>
  <AnswerDistributionList
    :distributions="distributions"
    :expanded-label="expandedLabel"
    :student-list-map="studentListMap"
    :compact="compact"
    @toggle-student-list="$emit('toggle-student-list', $event)"
  />
</template>

<script setup>
import AnswerDistributionList from "../../../../components/distribution/AnswerDistributionList.vue";

defineProps({
  distributions: {
    type: Array,
    default: () => [],
  },
  expandedLabel: {
    type: String,
    default: null,
  },
  studentListMap: {
    type: Object,
    default: () => ({}),
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-student-list"]);
</script>
