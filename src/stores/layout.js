import { defineStore } from 'pinia';
import { calculateAppScale, DESIGN_VIEWPORT } from '../shared/layout/appScale.js';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    designWidth: DESIGN_VIEWPORT.width,
    designHeight: DESIGN_VIEWPORT.height,
    appScale: 1,
  }),
  actions: {
    // Calculate app scale once from the current main-window CSS viewport.
    initializeScale(viewport = null) {
      const targetViewport = viewport || {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      this.appScale = calculateAppScale(targetViewport, {
        designWidth: this.designWidth,
        designHeight: this.designHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        compensateDevicePixelRatio: true,
      });

      console.info(
        `[layout] viewport=${targetViewport.width}x${targetViewport.height}, devicePixelRatio=${window.devicePixelRatio || 1}, appScale=${this.appScale}`
      );
    },
  },
});
