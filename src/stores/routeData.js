import { defineStore } from 'pinia';
import { requestBackend } from '../api/ipc';

export const useRouteDataStore = defineStore('routeData', {
  state: () => ({
    items: {},
    loading: false,
    error: ''
  }),
  actions: {
    async load(routeName) {
      this.loading = true;
      this.error = '';

      const result = await requestBackend({
        type: 'route-meta',
        route: routeName
      });

      this.loading = false;

      if (!result.ok) {
        this.error = result.error || '请求失败';
        return;
      }

      this.items[routeName] = result.data;
    }
  }
});
