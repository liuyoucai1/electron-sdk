import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AskFullscreenView from '../views/ask/AskFullscreenView.vue';
import ObjectiveQuestionDetail from '../views/ask/ObjectiveQuestionDetail.vue';
import MultiBatchAnalysisView from '../views/ask/MultiBatchAnalysisView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ask/fullscreen',
      name: 'ask-fullscreen',
      component: AskFullscreenView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/objective-detail',
      name: 'ask-objective-detail',
      component: ObjectiveQuestionDetail,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/multi-batch-analysis',
      name: 'ask-multi-batch-analysis',
      component: MultiBatchAnalysisView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

export default router;
