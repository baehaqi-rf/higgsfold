import test from "node:test";
import assert from "node:assert/strict";
import {
  getExportDimensions,
  validateTrimBounds,
  computeDrawRect
} from "../sidepanel/editing-room.js";
import { computeMotionSampleTimestamps } from "../sidepanel/motion-extractor.js";
import { normalizeSoulEntry } from "../sidepanel/soul-vault.js";

test("getExportDimensions calculates native aspect resolutions", () => {
  assert.deepEqual(getExportDimensions("16:9"), { width: 1280, height: 720 });
  assert.deepEqual(getExportDimensions("9:16"), { width: 720, height: 1280 });
  assert.deepEqual(getExportDimensions("1:1"), { width: 1080, height: 1080 });
  assert.deepEqual(getExportDimensions("2.39:1"), { width: 1280, height: 536 });
});

test("validateTrimBounds clamps negative, out-of-range, and inverted bounds safely", () => {
  assert.deepEqual(validateTrimBounds(-2, 99, 6), {
    inSec: 0,
    outSec: 6,
    trimDurSec: 6
  });
  assert.deepEqual(validateTrimBounds(4, 3, 6), {
    inSec: 4,
    outSec: 4.4,
    trimDurSec: 0.4
  });
  assert.deepEqual(validateTrimBounds(1.25, 3.75, 5), {
    inSec: 1.3,
    outSec: 3.8,
    trimDurSec: 2.5
  });
});

test("computeDrawRect centers without aspect stretching for cover and contain modes", () => {
  // 1080x1920 vertical video into 720x1280 9:16 canvas (exact aspect match)
  const exact = computeDrawRect(1080, 1920, 720, 1280, "cover");
  assert.equal(exact.dw, 720);
  assert.equal(exact.dh, 1280);
  assert.equal(Math.round(exact.sw), 1080);

  // 1920x1080 landscape into 1080x1080 square canvas with cover center-crop
  const squareCover = computeDrawRect(1920, 1080, 1080, 1080, "cover");
  assert.equal(Math.round(squareCover.sw), 1080);
  assert.equal(Math.round(squareCover.sh), 1080);
  assert.equal(Math.round(squareCover.sx), 420);

  // 1920x1080 landscape into 1080x1080 square canvas with contain letterbox
  const squareContain = computeDrawRect(1920, 1080, 1080, 1080, "contain");
  assert.equal(Math.round(squareContain.dw), 1080);
  assert.equal(Math.round(squareContain.dh), 608);
  assert.equal(Math.round(squareContain.dy), 236);
});

test("computeMotionSampleTimestamps extracts 3 frames for <=6s clips and 6 frames for >6s clips", () => {
  const shortFrames = computeMotionSampleTimestamps(5);
  assert.equal(shortFrames.length, 3);
  assert.deepEqual(shortFrames, [0.25, 2.5, 4.75]);

  const longFrames = computeMotionSampleTimestamps(10);
  assert.equal(longFrames.length, 6);
  assert.ok(longFrames[0] < longFrames[5]);
});

test("normalizeSoulEntry formats @handles cleanly and caps refs to 4", () => {
  const soul = normalizeSoulEntry({
    displayName: "Kai Noir",
    handle: "kai noir!!",
    dnaPrompt: "Charcoal coat",
    refs: [1, 2, 3, 4, 5].map((i) => ({ id: `r${i}`, dataUrl: `data:image/webp;base64,${i}` }))
  });
  assert.equal(soul.handle, "@kai_noir");
  assert.equal(soul.refs.length, 4);
});
