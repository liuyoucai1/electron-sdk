import { createRouter, createWebHashHistory } from 'vue-router';

const HomeView = () => import('../views/HomeView.vue');
const AskFullscreenView = () => import('../views/ask/AskFullscreenView.vue');
const ObjectiveQuestionDetail = () => import('../views/ask/ObjectiveQuestionDetail.vue');
const MultiBatchAnalysisView = () => import('../views/ask/MultiBatchAnalysisView.vue');
const ReadReciteProgressView = () => import('../views/ask/AnswerProgressView.vue');
const ReadReciteAnalysisView = () => import('../views/ask/subjective/ReadReciteAnalysisView.vue');
const ReadReciteStudentAnalysisView = () => import('../views/ask/subjective/ReadReciteStudentAnalysisView.vue');
const VoiceAnalysisView = () => import('../views/ask/subjective/VoiceAnalysisView.vue');
const VoiceStudentAnalysisView = () => import('../views/ask/subjective/VoiceStudentAnalysisView.vue');

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
