<template>
  <ReadReciteCompactLayout
    @fullscreen="$emit('fullscreen')"
    @minimize="$emit('minimize')"
    @close="$emit('close')"
  >
    <template #header>
      <div class="recite-header">
        <div class="mode-badge">{{ modeBadge }}</div>
        <div class="header-text">
          <h2 class="title">{{ pageTitle }}</h2>
          <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
        </div>
      </div>
    </template>

    <section class="compact-read-recite-analysis">
      <div class="content-preview-card">
        <h3 class="content-title">{{ subtitle }}</h3>
        <div class="content-html" v-html="contentHtml"></div>
      </div>

      <ReadReciteScoreDistribution
        compact
        :distributions="distributions"
        :expanded-label="expandedLabel"
        :student-list-map="studentListMap"
        @toggle-student-list="handleViewStudentList"
      />
    </section>
  </ReadReciteCompactLayout>
</template>

<script setup>
import ReadReciteCompactLayout from "../components/ReadReciteCompactLayout.vue";
import ReadReciteScoreDistribution from "../components/ReadReciteScoreDistribution.vue";
import { useReadReciteAnalysis } from "../composables/useReadReciteAnalysis.js";

defineProps({
  sessionId: {
    type: String,
    default: "",
  },
  step: {
    type: String,
    default: "",
  },
  reciteType: {
    type: String,
    default: "",
  },
});

defineEmits(["fullscreen", "minimize", "close"]);

const {
  pageTitle,
  subtitle,
  contentHtml,
  distributions,
  studentListMap,
  modeBadge,
  expandedLabel,
  handleViewStudentList,
} = useReadReciteAnalysis({ setupFullscreen: false });
</script>

<style scoped lang="scss">
.recite-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ez-p500);
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.header-text {
  min-width: 0;

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--ez-n900);
    line-height: 1.3;
  }

  .subtitle {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--ez-n100);
    color: var(--ez-n500);
    font-size: 11px;
    font-weight: 700;
  }
}

.compact-read-recite-analysis {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px 0 8px;
}

.content-preview-card {
  background: #fffbf0;
  border-radius: 14px;
  padding: 14px;
}

.content-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ez-n900);
}

.content-html {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ez-n700);
  max-height: 120px;
  overflow: hidden;

  :deep(p) {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
