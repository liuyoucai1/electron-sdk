import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { createPinia, setActivePinia } from "pinia";
import { useFlowStore } from "../../src/stores/flow.js";

describe("flow store ask actions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("open-answer-progress records entry and next fullscreen target", () => {
    const flowStore = useFlowStore();

    flowStore.startAskFlow();
    const target = flowStore.handleAskWidgetAction({
      action: "open-answer-progress",
      entrySource: "multi-question",
      questionType: "single",
      optionCount: 4,
      questionCount: 6,
    });

    assert.equal(target.displayMode, "small-page");
    assert.equal(target.pageType, "answer-progress");
    assert.equal(target.props.entrySource, "multi-question");
    assert.equal(flowStore.answerProgressEntry, "multi-question");
    assert.equal(flowStore.nextStep, "batch-analysis");
    assert.equal(flowStore.fullscreenRoute, "/ask/multi-batch-analysis");
  });

  test("finish-answering routes multi-question entry to batch analysis", () => {
    const flowStore = useFlowStore();

    flowStore.startAskFlow();
    flowStore.handleAskWidgetAction({
      action: "open-answer-progress",
      entrySource: "multi-question",
      questionType: "multiple",
      questionCount: 8,
    });
    const target = flowStore.handleAskWidgetAction({
      action: "finish-answering",
    });

    assert.equal(target.displayMode, "fullscreen");
    assert.equal(target.route, "/ask/multi-batch-analysis");
    assert.deepEqual(target.query, {
      entrySource: "multi-question",
      questionType: "multiple",
      batchSize: 8,
    });
    assert.equal(flowStore.currentStep, "batch-analysis");
    assert.equal(flowStore.viewMode, "fullscreen");
    assert.equal(flowStore.answerProgressEntry, null);
  });

  test("voice question from analysis returns to voice analysis with updated state", () => {
    const flowStore = useFlowStore();

    flowStore.startAskFlow();
    const smallPageTarget = flowStore.handleAskWidgetAction({
      action: "open-voice-question-from-analysis",
    });
    assert.equal(smallPageTarget.pageType, "voice-question-input");
    assert.equal(flowStore.voiceQuestionInputContext, "analysis");

    const fullscreenTarget = flowStore.handleAskWidgetAction({
      action: "start-voice-question",
      questionText: "Explain photosynthesis.",
      contentHtml: "<p>Explain photosynthesis.</p>",
    });

    assert.equal(fullscreenTarget.displayMode, "fullscreen");
    assert.equal(fullscreenTarget.route, "/ask/voice-analysis");
    assert.equal(flowStore.voiceQuestionInputContext, null);
    assert.equal(flowStore.voiceAnalysisState.questionText, "Explain photosynthesis.");
  });
});
