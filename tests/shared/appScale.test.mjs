import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { calculateAppScale } from "../../src/shared/layout/appScale.js";

describe("calculateAppScale", () => {
  test("returns 1 for the 1920x1080 design viewport", () => {
    assert.equal(calculateAppScale({ width: 1920, height: 1080 }), 1);
  });

  test("uses the smaller width or height ratio", () => {
    assert.equal(calculateAppScale({ width: 1366, height: 1080 }), 0.75);
    assert.equal(calculateAppScale({ width: 1920, height: 900 }), 900 / 1080);
  });

  test("allows larger screens to scale up from the design viewport", () => {
    assert.equal(calculateAppScale({ width: 2560, height: 1440 }), 2560 / 1920);
  });

  test("softly compensates high-DPI system scaling", () => {
    assert.equal(
      calculateAppScale(
        { width: 1536, height: 912 },
        { devicePixelRatio: 2, compensateDevicePixelRatio: true },
      ),
      0.75,
    );
    const fourKAt200 = calculateAppScale(
      { width: 1920, height: 1080 },
      { devicePixelRatio: 2, compensateDevicePixelRatio: true },
    );
    assert.equal(fourKAt200, 0.75);
  });

  test("clamps invalid or extreme viewport values", () => {
    assert.equal(calculateAppScale({ width: 0, height: 1080 }), 1);
    assert.equal(calculateAppScale({ width: 320, height: 180 }), 0.75);
    assert.equal(calculateAppScale({ width: 7680, height: 4320 }), 2);
  });
});
