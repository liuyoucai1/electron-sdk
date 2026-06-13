import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AskFullscreenView from '../views/ask/AskFullscreenView.vue';
import ObjectiveQuestionDetail from '../views/ask/ObjectiveQuestionDetail.vue';
import MultiBatchAnalysisView from '../views/ask/MultiBatchAnalysisView.vue';
import ReadReciteProgressView from '../views/ask/subjective/ReadReciteProgressView.vue';
import ReadReciteAnalysisView from '../views/ask/subjective/ReadReciteAnalysisView.vue';
import ReadReciteStudentAnalysisView from '../views/ask/subjective/ReadReciteStudentAnalysisView.vue';
import VoiceAnalysisView from '../views/ask/subjective/VoiceAnalysisView.vue';
import VoiceStudentAnalysisView from '../views/ask/subjective/VoiceStudentAnalysisView.vue';

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
      path: '/ask/answer-progress',
      name: 'ask-answer-progress',
      component: ReadReciteProgressView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/read-recite-progress',
      redirect: '/ask/answer-progress'
    },
    {
      path: '/ask/read-recite-analysis',
      name: 'ask-read-recite-analysis',
      component: ReadReciteAnalysisView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/read-recite-student-analysis',
      name: 'ask-read-recite-student-analysis',
      component: ReadReciteStudentAnalysisView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/voice-analysis',
      name: 'ask-voice-analysis',
      component: VoiceAnalysisView,
      meta: {
        fullscreen: true
      }
    },
    {
      path: '/ask/voice-student-analysis',
      name: 'ask-voice-student-analysis',
      component: VoiceStudentAnalysisView,
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
