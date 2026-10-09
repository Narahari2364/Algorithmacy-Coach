import assert from "node:assert/strict";
import test from "node:test";

import { fallbackTips } from "../data/fallbackTips";
import { personas } from "../data/personas";
import { platformIds } from "../data/platforms";
import { questions } from "../data/questions";
import { buildFallback } from "./coach-copy";
import { parseCoachResponse } from "./parse-coach";
import { phiFile, platformPhi, variantKey, variantPhi } from "./phi";
import { scoreAnswers, shareText, weakestQuestions } from "./score";
import { wordCount } from "./utils";

test("Riya and Sam match the rubric", () => {
  const riya = scoreAnswers(personas.riya.answers);
  const sam = scoreAnswers(personas.sam.answers);
  assert.deepEqual(riya, { score: 1, level: "Passive" });
  assert.deepEqual(sam, { score: 11, level: "Deliberate" });
  assert.equal(personas.riya.platform, "instagram");
  assert.equal(personas.sam.platform, "instagram");
});

test("level bands", () => {
  assert.equal(scoreAnswers([0, 0, 0, 0, 0, 0]).level, "Passive");
  assert.equal(scoreAnswers([2, 2, 0, 0, 0, 0]).level, "Passive");
  assert.equal(scoreAnswers([1, 1, 1, 1, 1, 0]).level, "Aware");
  assert.equal(scoreAnswers([2, 2, 2, 2, 0, 0]).level, "Aware");
  assert.equal(scoreAnswers([2, 2, 2, 1, 1, 1]).level, "Deliberate");
  assert.equal(scoreAnswers([2, 2, 2, 2, 2, 2]).level, "Deliberate");
});

test("weakest questions break ties by earlier index", () => {
  assert.deepEqual(weakestQuestions([0, 0, 0, 0, 1, 0]), [0, 1, 2]);
  assert.deepEqual(weakestQuestions([2, 2, 2, 2, 1, 2]), [4, 0, 1]);
});

test("share text matches the spec", () => {
  assert.equal(
    shareText("Passive", 1, "Instagram", "https://example.com"),
    "I scored Passive (1/12) on Instagram with Algorithmacy Coach: https://example.com",
  );
});

test("phi results come from the precompute file", () => {
  assert.equal(phiFile.control_passed, true);
  assert.equal(phiFile.instrument.includes("PyPhi"), true);
  for (const id of platformIds) {
    const row = platformPhi(id);
    assert.ok(row.rules.length > 0);
    assert.ok(row.verdict === "triadic" || row.verdict === "dyadic");
    assert.equal(typeof row.phi, "number");
  }
  assert.equal(platformPhi("instagram").verdict, "triadic");
  assert.equal(platformPhi("instagram").phi, 2);
  assert.deepEqual(platformPhi("instagram").major_complex, ["U", "A", "C"]);
  assert.equal(platformPhi("email").rules, "A'=U; C'=A; U'=U");
  assert.equal(platformPhi("email").verdict, "dyadic");
  assert.equal(platformPhi("email").phi, 0);
});

test("twelve personalized variants come from the precompute file", () => {
  const keys = Object.keys(phiFile.variants);
  assert.equal(keys.length, 12);
  for (const key of keys) {
    const row = phiFile.variants[key as keyof typeof phiFile.variants];
    assert.equal(row.u_in_major_complex, (row.major_complex ?? []).includes("U"));
  }
  assert.equal(variantKey("instagram", personas.riya.answers), "instagram:false:false");
  assert.equal(variantKey("instagram", personas.sam.answers), "instagram:true:true");
  const riya = variantPhi("instagram", [...personas.riya.answers]);
  assert.equal(riya.verdict, "dyadic");
  assert.equal(riya.phi, 0);
  assert.equal(riya.uInMajorComplex, false);
  const sam = variantPhi("instagram", [...personas.sam.answers]);
  assert.equal(sam.verdict, "triadic");
  assert.equal(sam.phi, 0.41503749927884376);
  assert.equal(sam.uInMajorComplex, true);
  assert.deepEqual(sam.major_complex, ["U", "A"]);
  const email = variantPhi("email", [0, 0, 0, 0, 0, 0]);
  assert.equal(email.key, "email:false:false");
  assert.equal(email.verdict, "dyadic");
  assert.equal(email.phi, 0);
  assert.equal(email.uInMajorComplex, true);
  assert.equal(email.rules, "A'=U; U'=U; C'=A");
});

test("fallback copy stays inside the word limits", () => {
  for (const id of platformIds) {
    for (const answers of [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2],
      [...personas.riya.answers],
      [...personas.sam.answers],
    ]) {
      const copy = buildFallback(id, answers);
      assert.ok(wordCount(copy.headline) <= 12, copy.headline);
      assert.ok(wordCount(copy.explanation) <= 45, copy.explanation);
      assert.equal(copy.tips.length, 3);
      for (const tip of copy.tips) assert.ok(wordCount(tip) <= 25, tip);
    }
  }
  for (const id of platformIds) {
    assert.equal(fallbackTips[id].length, questions.length);
  }
});

test("parser strips fences and rejects bad shapes", () => {
  const parsed = parseCoachResponse(
    '```json\n{"headline":"Hello there friend","explanation":"A short note.","tips":["One","Two","Three"]}\n```',
  );
  assert.equal(parsed?.headline, "Hello there friend");
  assert.deepEqual(parsed?.tips, ["One", "Two", "Three"]);
  assert.equal(parseCoachResponse("not json"), null);
  assert.equal(parseCoachResponse('{"headline":"Hi","explanation":"Yo","tips":["Only"]}'), null);
  const long = parseCoachResponse(
    JSON.stringify({
      headline: "one two three four five six seven eight nine ten eleven twelve thirteen",
      explanation: "words ".repeat(50),
      tips: ["a ".repeat(30), "b", "c"],
    }),
  );
  assert.equal(wordCount(long?.headline ?? ""), 12);
  assert.equal(wordCount(long?.explanation ?? ""), 45);
  assert.equal(wordCount(long?.tips[0] ?? ""), 25);
});
