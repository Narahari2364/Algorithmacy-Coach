import assert from "node:assert/strict";
import test from "node:test";

import { fallbackTips } from "../data/fallbackTips";
import { personas } from "../data/personas";
import { getPlatform, isPlatformId, platformIds } from "../data/platforms";
import { questions } from "../data/questions";
import { buildFallback } from "./coach-copy";
import { changeNote, mathFindings, structureHeadline, whyLine } from "./explain";
import { parseCoachResponse } from "./parse-coach";
import { asVerdict, coreLine, phiFile, platformPhi, variantKey, variantPhi } from "./phi";
import { scoreAnswers, shareText, weakestQuestions } from "./score";
import { formatPhi, wordCount } from "./utils";

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

test("phi displays to two decimals and membership needs a tangle", () => {
  assert.equal(formatPhi(0), "0.00");
  assert.equal(formatPhi(1), "1.00");
  assert.equal(formatPhi(2), "2.00");
  assert.equal(formatPhi(0.41503749927884376), "0.42");

  const expected: Record<string, { line: string; core: string | null }> = {
    "instagram:false:false": {
      line: "No tangle for you: you don't react to what the ranker does, so for you it just passes things along. Users who adapt to it get pulled in.",
      core: null,
    },
    "instagram:false:true": {
      line: "No tangle for you: you don't react to what the ranker does, so for you it just passes things along. Users who adapt to it get pulled in.",
      core: null,
    },
    "instagram:true:false": {
      line: "You're in the game, but not steering yet.",
      core: null,
    },
    "instagram:true:true": {
      line: "You're in the game, but not steering yet.",
      core: "The core is you and the ranker.",
    },
    "uber:false:false": {
      line: "No tangle for you: you don't react to what the dispatch does, so for you it just passes things along. Users who adapt to it get pulled in.",
      core: null,
    },
    "uber:false:true": {
      line: "No tangle for you: you don't react to what the dispatch does, so for you it just passes things along. Users who adapt to it get pulled in.",
      core: null,
    },
    "uber:true:false": {
      line: "You're carried along without reacting to it.",
      core: "The core is the dispatch and the rider.",
    },
    "uber:true:true": {
      line: "You're in the game, but not steering yet.",
      core: "The core is you and the dispatch.",
    },
    "email:false:false": {
      line: "There's no tangle here: Email acts like a pipe.",
      core: null,
    },
    "email:false:true": {
      line: "There's no tangle here: Email acts like a pipe.",
      core: null,
    },
    "email:true:false": {
      line: "There's no tangle here: Email acts like a pipe.",
      core: null,
    },
    "email:true:true": {
      line: "There's no tangle here: Email acts like a pipe.",
      core: null,
    },
  };

  for (const [key, want] of Object.entries(expected)) {
    const row = phiFile.variants[key as keyof typeof phiFile.variants];
    assert.equal(isPlatformId(row.platform), true, key);
    if (!isPlatformId(row.platform)) continue;
    const platform = getPlatform(row.platform);
    const line = structureHeadline(platform, row.phi, row.u_in_major_complex, "Passive");
    const core = coreLine(asVerdict(row.verdict), row.major_complex, platform.diagram);
    assert.equal(line, want.line, key);
    assert.equal(core, want.core, key);
    assert.equal(formatPhi(row.phi), row.phi === 0.41503749927884376 ? "0.42" : row.phi.toFixed(2));
    if (!(row.phi > 0)) {
      assert.equal(/part of the tangle|outside the tangle/i.test(line), false, key);
    } else if ((row.major_complex ?? []).length < 3) {
      assert.equal(row.verdict, "triadic", key);
      assert.ok(core, key);
    }
  }

  const emailPlatform = getPlatform("email");
  const emailHeadline = structureHeadline(emailPlatform, 0, true, "Passive");
  assert.match(emailHeadline, /There's no tangle here: Email acts like a pipe/);
  const instagramHeadline = structureHeadline(getPlatform("instagram"), 0, false, "Passive");
  assert.equal(/acts like a pipe/i.test(instagramHeadline), false);
  const uberOut = variantPhi("uber", [0, 0, 0, 2, 0, 0]);
  const uberIn = variantPhi("uber", [0, 0, 0, 2, 0, 2]);
  const note = changeNote(uberIn, uberOut, getPlatform("uber"));
  assert.match(note ?? "", /takes you out of the tangle/);
  const findings = mathFindings();
  assert.equal(findings[0]?.focusKey, "uber:true:false");
  assert.equal(findings[1]?.focusKey, "instagram:true:true");
  assert.match(findings[0]?.line ?? "", /1\.00/);
  assert.match(findings[1]?.line ?? "", /2\.00/);
  assert.match(findings[1]?.line ?? "", /0\.42/);
  assert.equal(/Core Φ/.test(whyLine(uberOut.rules, getPlatform("uber"))), false);
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
