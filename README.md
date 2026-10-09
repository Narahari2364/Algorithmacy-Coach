# Algorithmacy Coach

Algorithmacy Coach tells you two things about an app you use: whether the app's algorithm is a real third player between you and the people on the other side, and whether you are steering that algorithm or it is steering you.

A 60-second check. The score is a deterministic rubric. The structural verdict is exact Φ, precomputed with PyPhi.

Run it locally with `npm run dev` and open [http://127.0.0.1:43123](http://127.0.0.1:43123). A public Vercel URL is added here after the project is linked to a Vercel account.

![Landing page](docs/screenshots/landing-desktop.png)

## What it does

| Reading | Question | Source |
|---|---|---|
| Structure (Triad Check) | Are you inside this model's tangle? | Φ on the variant picked by questions 4 and 6 |
| Competence (Coach score) | Do you have it? | Six-question prototype rubric |

## Riya and Sam

Same platform, different variants, different people.

| | Riya | Sam |
|---|---|---|
| Answers | 0, 0, 0, 0, 1, 0 | 2, 2, 2, 2, 1, 2 |
| Score | 1/12 Passive | 11/12 Deliberate |
| Platform | Instagram | Instagram |

![Riya, passive](docs/screenshots/results-riya-mobile.png)
![Sam, deliberate](docs/screenshots/results-sam-mobile.png)

## Architecture

```mermaid
flowchart LR
  U[User on phone] --> P[Next.js app on Vercel]
  P --> S[Deterministic scorer]
  P --> J[phi_results.json]
  P --> G[api/coach]
  G --> X[Grok via xAI API]
  G -. fallback .-> F[Templated tips]
  PY[PyPhi + algorithmacy-lab<br/>run once locally] --> J
```

Grok writes the headline, explanation, and tips. The score never depends on the model. If the key is missing, the call fails, or it takes longer than 8 seconds, the same screen fills from templated tips.

## How the Triad Check works

```mermaid
flowchart LR
  A[Plain-English platform] --> M[3-node Boolean model<br/>user, algorithm, counterpart]
  M --> T[Transition table]
  T --> PHI[Exact Φ with PyPhi]
  PHI --> V{Irreducible across<br/>all three?}
  V -- yes --> TRI[Triadic: demands algorithmacy]
  V -- no --> DY[Dyadic: the app is a pipe]
```

The verdict is the lab's own classifier: Φ over the minimum-information partition (`org_frontier.classifier.classify_rules`). Triadic when max Φ_MIP > 1e-9, otherwise dyadic. That call is on the whole three-node system, at its most-integrated reachable state. It is not Φ of the major complex, which is recorded separately with `org_frontier.probes.lib.major_complex`. A whole-system triadic label can still have a two-party core. Numbers below are whatever that run wrote into `public/data/phi_results.json`. They are not edited by hand. The card rounds Φ to two decimals.

The instrument control (`python -m org_frontier.classifier.validate`, the core check in `ci/reproduce.json`) passed before these values were written. See `phi/instrument_control.txt`.

The three bases, before either switch:

| Platform | U (user) | A (algorithm) | C (counterpart) | Rules | Verdict | Φ |
|---|---|---|---|---|---|---|
| Instagram | creator posts | feed ranker | audience | A'=U AND C; U'=A; C'=A | triadic | 2.00 |
| Uber | driver goes online | dispatch | rider | A'=U AND C; U'=A; C'=A AND U | triadic | 1.00 |
| Email (comparison) | sender | mail server | recipient | A'=U; C'=A; U'=U | dyadic | 0.00 |

Email stays the forward-only chain from the lab's back-edge thread: the sender holds its own state and does not read the recipient. That base is what the switches edit.

Two switches, applied on top of each base, make twelve models. Keys are `platform:adapts:alternatives`.

- Adapts is question 4 scored 1 or 2. If not, `U' = U`: the user ignores the algorithm. If so, U keeps the base rule.
- Alternatives is question 6 scored 2. If so, `C' = (base rule for C) OR U`: a direct channel from the user to the counterpart. If not, C keeps the base rule.

The results screen looks up that key. "You are part of the tangle" appears only when Φ > 0 and U is in the major complex. Otherwise, if Φ > 0, the card says "You sit outside the tangle". If Φ = 0, it says "There's no tangle here: {app} acts like a pipe" and does not mention membership. When the classifier's whole-system label is triadic and the major complex has fewer than three parties, the card keeps "triadic" and names that core in plain English. Φ on the card is the classifier's max Φ_MIP, rounded to two decimals. None of these numbers were typed in by hand.

| Key | Rules | Verdict | Φ | Major complex | Card |
|---|---|---|---|---|---|
| `instagram:false:false` | A'=U AND C; U'=U; C'=A | dyadic | 0.00 | A, C | There's no tangle here: Instagram acts like a pipe |
| `instagram:false:true` | A'=U AND C; U'=U; C'=(A) OR U | dyadic | 0.00 | U | There's no tangle here: Instagram acts like a pipe |
| `instagram:true:false` | A'=U AND C; U'=A; C'=A | triadic | 2.00 | U, A, C | You are part of the tangle |
| `instagram:true:true` | A'=U AND C; U'=A; C'=(A) OR U | triadic | 0.42 | U, A | You are part of the tangle. The core is you and the ranker. |
| `uber:false:false` | A'=U AND C; U'=U; C'=A AND U | dyadic | 0.00 | A, C | There's no tangle here: Uber acts like a pipe |
| `uber:false:true` | A'=U AND C; U'=U; C'=(A AND U) OR U | dyadic | 0.00 | U | There's no tangle here: Uber acts like a pipe |
| `uber:true:false` | A'=U AND C; U'=A; C'=A AND U | triadic | 1.00 | A, C | You sit outside the tangle. The core is the dispatch and the rider. |
| `uber:true:true` | A'=U AND C; U'=A; C'=(A AND U) OR U | triadic | 2.00 | U, A | You are part of the tangle. The core is you and the dispatch. |
| `email:false:false` | A'=U; U'=U; C'=A | dyadic | 0.00 | U | There's no tangle here: Email acts like a pipe |
| `email:false:true` | A'=U; U'=U; C'=(A) OR U | dyadic | 0.00 | U | There's no tangle here: Email acts like a pipe |
| `email:true:false` | A'=U; U'=U; C'=A | dyadic | 0.00 | U | There's no tangle here: Email acts like a pipe |
| `email:true:true` | A'=U; U'=U; C'=(A) OR U | dyadic | 0.00 | U | There's no tangle here: Email acts like a pipe |

Email's base already sets `U' = U`, so the adapts switch does not change its user rule. All four email variants stay dyadic at Φ 0.00, so the card calls Email a pipe and does not mention membership. `instagram:true:true` and `uber:true:true` stay triadic while the core is only you and the algorithm. `uber:true:false` stays triadic at Φ 1.00 with the core on dispatch and the rider, so you sit outside it.

```json
{
  "variants": {
    "instagram:false:false": {
      "phi": 0.0,
      "verdict": "dyadic",
      "major_complex": ["A", "C"],
      "u_in_major_complex": false,
      "rules": "A'=U AND C; U'=U; C'=A"
    }
  }
}
```

## Scoring rubric

Each answer scores 0 (passive), 1 (mixed), or 2 (deliberate). Total 0–12. Levels: 0–4 Passive, 5–8 Aware, 9–12 Deliberate.

| # | Theme | 0 | 1 | 2 |
|---|---|---|---|---|
| 1 | Discovery | I just take what {app} shows me | A mix of feed and my own choices | I mostly search or go to things I picked |
| 2 | Understanding | No idea why things show up | A rough idea | I can name the signals it uses |
| 3 | Tuning | I never adjust anything | Sometimes | I regularly mute, hide or reset |
| 4 | Adapting | I never change how I act for it | Sometimes, without a plan | I test times, formats or zones on purpose |
| 5 | Noticing | I don't notice being steered | Occasionally | I notice and decide whether to go along |
| 6 | Alternatives | {app} is my only channel to {counterpart} | I use one other channel a bit | I keep real alternatives to reach {counterpart} |

Question 6 echoes the lab's finding that a genuine substitute loosens a platform's hold.

## Run locally

```bash
npm install
cp .env.example .env.local   # XAI_API_KEY is optional; XAI_MODEL defaults to grok-4.7
npm run dev                  # http://127.0.0.1:43123
```

Rerun the structural verdicts, after the lab checkout and the PyPhi venv described in `PLAN.md`:

```bash
phi/.venv/bin/python phi/precompute_phi.py
```

`phi/vendor` and `phi/.venv` are gitignored. The script refuses to write trusted verdicts if the instrument control fails.

## Built with

Grok (xAI), Grok Bot in Cursor, PyPhi, [algorithmacy-lab](https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab), Next.js, Vercel.

## Credits

Inspired by Roger Hunt's algorithmacy research. Structural verdicts are computed with PyPhi (IIT 4.0) via the open algorithmacy-lab repo, on simplified three-party models of each platform.

The coach score is a prototype rubric, not a validated measure.

Your answers are not stored.

## License

MIT. algorithmacy-lab is also MIT; this project uses its classifier and does not vendor the lab into the deploy.
