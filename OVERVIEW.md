# Algorithmacy Coach

## The problem

People coordinate with audiences, riders, and customers through algorithms they cannot see. Most of them never ask whether the platform is a neutral pipe or an active party shaping both sides. They also get no feedback on how deliberately they navigate it.

## The research idea

Roger Hunt's algorithmacy lab treats a coordination as dyadic when it splits into independent two-party pieces, and triadic when it stays irreducible across the user, the algorithm, and the counterpart. The measure is exact integrated information, Φ, in the IIT 4.0 sense, computed with PyPhi. A dyad asks for ordinary literacy. A triad asks for algorithmacy: the skill of steering a coordination whose third party you do not control.

```mermaid
flowchart LR
  subgraph Pipe
    S1[You] --> M1[Mail server] --> R1[Recipient]
  end
  subgraph Third player
    S2[You] --> A2[Feed algorithm]
    R2[Audience] --> A2
    A2 --> S2
    A2 --> R2
  end
```

Email is the pipe. Its base rules are a forward-only chain, the case the lab's back-edge thread isolates: the sender holds its own state (`U' = U`), the server copies the sender (`A' = U`), and the recipient copies the server (`C' = A`). Nothing reads back. Instagram's base is the third player: the ranker updates from both sides (`A' = U AND C`), and both sides update from the ranker.

Two answers edit that base before Φ is read. If you do not adapt (question 4 scored 0), your node ignores the algorithm (`U' = U`). If you keep a real alternative (question 6 scored 2), a direct channel opens (`C' = (base C) OR U`). Question 6 is the lab's finding that a genuine substitute loosens a platform's hold, written into the model instead of only into the rubric.

## Riya and Sam

Both open Instagram. Their structural readings are different variants.

Riya answers 0, 0, 0, 0, 1, 0. She does not adapt and has no alternative, so the key is `instagram:false:false`. The classifier says dyadic, Φ 0, major complex A and C. She sits outside the tangle. The coach score is 1/12, Passive.

![Riya](docs/screenshots/results-riya-mobile.png)

Sam answers 2, 2, 2, 2, 1, 2. He adapts and keeps another channel, so the key is `instagram:true:true`. The classifier says triadic, Φ 0.41503749927884376, major complex U and A. He is part of the tangle. The coach score is 11/12, Deliberate.

![Sam](docs/screenshots/results-sam-mobile.png)

The score uses all six answers. The tangle line uses only whether U is in the major complex of the variant those two answers select.

## What is computed, and what is a rubric

| | Computed | Rubric |
|---|---|---|
| Question | Is this variant irreducible, and is U in its major complex? | How deliberately does this person navigate? |
| Method | Exact Φ, IIT 4.0, via algorithmacy-lab | Six questions, 0–2 each, total 0–12 |
| Changes when | The Boolean rules change and the precompute is rerun | The person answers differently |
| Riya | `instagram:false:false`, dyadic, Φ 0, U outside | 1/12 Passive |
| Sam | `instagram:true:true`, triadic, Φ 0.41503749927884376, U inside | 11/12 Deliberate |

Base models, then the twelve variants from `public/data/phi_results.json`:

| Platform | U (user) | A (algorithm) | C (counterpart) | Rules | Verdict | Φ |
|---|---|---|---|---|---|---|
| Instagram | creator posts | feed ranker | audience | A'=U AND C; U'=A; C'=A | triadic | 2 |
| Uber | driver goes online | dispatch | rider | A'=U AND C; U'=A; C'=A AND U | triadic | 1 |
| Email (comparison) | sender | mail server | recipient | A'=U; C'=A; U'=U | dyadic | 0 |

| Key | Rules | Verdict | Φ | Major complex | U in it |
|---|---|---|---|---|---|
| `instagram:false:false` | A'=U AND C; U'=U; C'=A | dyadic | 0 | A, C | no |
| `instagram:false:true` | A'=U AND C; U'=U; C'=(A) OR U | dyadic | 0 | U | yes |
| `instagram:true:false` | A'=U AND C; U'=A; C'=A | triadic | 2 | U, A, C | yes |
| `instagram:true:true` | A'=U AND C; U'=A; C'=(A) OR U | triadic | 0.41503749927884376 | U, A | yes |
| `uber:false:false` | A'=U AND C; U'=U; C'=A AND U | dyadic | 0 | A, C | no |
| `uber:false:true` | A'=U AND C; U'=U; C'=(A AND U) OR U | dyadic | 0 | U | yes |
| `uber:true:false` | A'=U AND C; U'=A; C'=A AND U | triadic | 1 | A, C | no |
| `uber:true:true` | A'=U AND C; U'=A; C'=(A AND U) OR U | triadic | 2 | U, A | yes |
| `email:false:false` | A'=U; U'=U; C'=A | dyadic | 0 | U | yes |
| `email:false:true` | A'=U; U'=U; C'=(A) OR U | dyadic | 0 | U | yes |
| `email:true:false` | A'=U; U'=U; C'=A | dyadic | 0 | U | yes |
| `email:true:true` | A'=U; U'=U; C'=(A) OR U | dyadic | 0 | U | yes |

Uber that adapts without an alternative (`uber:true:false`) is triadic at Φ 1, and U is not in the major complex. The system is a tangle. You are not in it. Email never leaves Φ 0. Its major complex is only the sender, so the card still says you are part of the tangle: membership, not the three-node verdict, chooses that sentence.

Grok writes the sentences on the results screen. It does not choose the score or the verdict. With no API key, the screen uses templated tips and looks the same.

## What is next

More platforms. A larger model for each one. A comparison of this rubric against the lab's survey instrument, once that instrument is published.
