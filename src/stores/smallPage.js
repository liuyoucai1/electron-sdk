import { defineStore } from 'pinia';

const SMALL_PAGE_PRESETS = {
  'ask-entry': {
    title: '发起提问',
    width: 470,
    height: 650
  },
  'answer-progress': {
    title: '答题进行中',
    width: 470,
    height: 360
  },
  'multi-question': {
    title: '多题提问',
    width: 390,
    height: 460
  },
  'read-recite': {
    title: '背读',
    width: 975,
    height: 710
  },
  'select-question': {
    title: '选题提问',
    width: 975,
    height: 710
  }
};

const INITIAL_STATE = {
  activePage: null
};

export const useSmallPageStore = defineStore('smallPage', {
  state: () => ({
    ...INITIAL_STATE
  }),
  actions: {
    // 打开普通小屏页面，只写入业务承载所需的最小信息。
    openPage(type, props = {}) {
      const preset = SMALL_PAGE_PRESETS[type];

      if (!preset) {
        this.activePage = null;
        return;
      }

      this.activePage = {
        id: `small-page-${type}`,
        type,
        title: preset.title,
        width: preset.width,
        height: preset.height,
        props
      };
    },

    // 清空普通小屏页面。
    closePage() {
      this.activePage = null;
    }
  }
});
