<template>
  <div class="select-question-sidebar">
    <div class="sidebar-title">题集列表</div>
    <div class="nav-list">
      <button
        v-for="item in selfBooklets"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: activeBooklet === item.id }"
        @click="activeBooklet = item.id"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { selfBooklets } from '../../../../mock/selectQuestion.js';

const activeBooklet = ref(selfBooklets[0]?.id || '');
</script>
