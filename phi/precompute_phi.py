"""Precompute exact IIT-4.0 Φ verdicts for the Algorithmacy Coach platforms.

Follows algorithmacy-lab's own protocol:

1. Run the instrument control registered in ``ci/reproduce.json``
   (``python -m org_frontier.classifier.validate``, ``"core": true``).
2. Classify each three-node Boolean model with
   ``org_frontier.classifier.classify_rules`` — Φ over the minimum-information
   partition. Triadic when max Φ_MIP > 1e-9, otherwise dyadic.
3. Record the major complex with ``org_frontier.probes.lib.major_complex``.

Little-endian node order matches the lab: index 0 = U (user), 1 = A (algorithm),
2 = C (counterpart).

Run from the repo root:

    phi/.venv/bin/python phi/precompute_phi.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, ".."))
LAB = os.path.join(HERE, "vendor", "algorithmacy-lab")
PYTHON = os.path.join(HERE, ".venv", "bin", "python")
OUT = os.path.join(REPO, "public", "data", "phi_results.json")
CONTROL_LOG = os.path.join(HERE, "instrument_control.txt")

sys.path.insert(0, LAB)
os.environ.setdefault("PYPHI_WELCOME_OFF", "true")

# Node order: 0 = U, 1 = A, 2 = C. Rules are the plan's update functions, not
# hand-tuned for a target verdict.
PLATFORMS = {
    "instagram": {
        "rules_text": "A'=U AND C; U'=A; C'=A",
        "rules": [
            lambda x: x[1],  # U' = A
            lambda x: x[0] & x[2],  # A' = U AND C
            lambda x: x[1],  # C' = A
        ],
        "parties": {
            "U": "creator posts",
            "A": "feed ranker",
            "C": "audience",
        },
    },
    "uber": {
        "rules_text": "A'=U AND C; U'=A; C'=A AND U",
        "rules": [
            lambda x: x[1],  # U' = A
            lambda x: x[0] & x[2],  # A' = U AND C
            lambda x: x[1] & x[0],  # C' = A AND U
        ],
        "parties": {
            "U": "driver goes online",
            "A": "dispatch",
            "C": "rider",
        },
    },
    "email": {
        # Forward-only chain from the lab's back-edge thread. The sender holds
        # its own state and never reads the recipient. This is the base the
        # personalized variants start from.
        "rules_text": "A'=U; C'=A; U'=U",
        "rules": [
            lambda x: x[0],  # U' = U
            lambda x: x[0],  # A' = U
            lambda x: x[1],  # C' = A
        ],
        "parties": {
            "U": "sender",
            "A": "mail server",
            "C": "recipient",
        },
    },
}

LABELS = ("U", "A", "C")


def _hold_user(state):
    """U' = U. The user ignores the algorithm and keeps their own state."""
    return state[0]


def _or_user(base_c):
    """C' = (base rule for C) OR U. A direct user-to-counterpart channel."""

    def rule(state, base_c=base_c):
        return base_c(state) | state[0]

    return rule


def variant_models():
    """Four switches per platform: adapts (Q4 >= 1) and alternatives (Q6 == 2).

    Keys are ``platform:adapts:alternatives``, for example ``instagram:true:false``.
    """
    pieces = {
        "instagram": {
            "u_rule": lambda state: state[1],
            "a_rule": lambda state: state[0] & state[2],
            "c_rule": lambda state: state[1],
            "u_text": "U'=A",
            "a_text": "A'=U AND C",
            "c_text": "C'=A",
            "c_rhs": "A",
        },
        "uber": {
            "u_rule": lambda state: state[1],
            "a_rule": lambda state: state[0] & state[2],
            "c_rule": lambda state: state[1] & state[0],
            "u_text": "U'=A",
            "a_text": "A'=U AND C",
            "c_text": "C'=A AND U",
            "c_rhs": "A AND U",
        },
        "email": {
            "u_rule": lambda state: state[0],
            "a_rule": lambda state: state[0],
            "c_rule": lambda state: state[1],
            "u_text": "U'=U",
            "a_text": "A'=U",
            "c_text": "C'=A",
            "c_rhs": "A",
        },
    }
    models = []
    for name, piece in pieces.items():
        for adapts in (False, True):
            for alternatives in (False, True):
                u_rule = piece["u_rule"] if adapts else _hold_user
                u_text = piece["u_text"] if adapts else "U'=U"
                if alternatives:
                    c_rule = _or_user(piece["c_rule"])
                    c_text = f"C'=({piece['c_rhs']}) OR U"
                else:
                    c_rule = piece["c_rule"]
                    c_text = piece["c_text"]
                models.append(
                    {
                        "key": f"{name}:{str(adapts).lower()}:{str(alternatives).lower()}",
                        "platform": name,
                        "adapts": adapts,
                        "alternatives": alternatives,
                        "rules": [u_rule, piece["a_rule"], c_rule],
                        "rules_text": f"{piece['a_text']}; {u_text}; {c_text}",
                    }
                )
    return models


def run_instrument_control() -> bool:
    """The core instrument check: classifier.validate. Compute, do not assert."""
    proc = subprocess.run(
        [PYTHON if os.path.exists(PYTHON) else sys.executable, "-m", "org_frontier.classifier.validate"],
        cwd=LAB,
        capture_output=True,
        text=True,
        env={**os.environ, "PYPHI_WELCOME_OFF": "true"},
    )
    text = (proc.stdout or "") + (proc.stderr or "")
    with open(CONTROL_LOG, "w", encoding="utf-8") as handle:
        handle.write(text)
        if not text.endswith("\n"):
            handle.write("\n")
        handle.write(f"exit_code: {proc.returncode}\n")
    print(text, end="" if text.endswith("\n") else "\n")
    passed = proc.returncode == 0 and "Instrument validated" in text
    if not passed:
        print("Instrument control FAILED. Refusing to write verdicts.", file=sys.stderr)
    return passed


def main() -> int:
    control_passed = run_instrument_control()
    if not control_passed:
        payload = {
            "computed_at": datetime.now(timezone.utc).isoformat(),
            "instrument": "PyPhi IIT-4.0 via algorithmacy-lab",
            "control_passed": False,
            "platforms": {
                key: {
                    "phi": None,
                    "verdict": None,
                    "major_complex": None,
                    "rules": spec["rules_text"],
                }
                for key, spec in PLATFORMS.items()
            },
        }
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        with open(OUT, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        return 1

    from org_frontier.classifier.classifier import classify_rules
    from org_frontier.probes.lib import major_complex

    platforms = {}
    for key, spec in PLATFORMS.items():
        verdict = classify_rules(spec["rules"], labels=LABELS)
        core, core_phi = major_complex(spec["rules"], LABELS)
        platforms[key] = {
            "phi": verdict.max_phi,
            "verdict": verdict.structure,
            "competence": verdict.competence,
            "major_complex": list(core) if core else None,
            "major_complex_phi": None if core is None else core_phi,
            "rules": spec["rules_text"],
            "parties": spec["parties"],
            "mip_partition": verdict.mip_partition,
            "mip_state": list(verdict.mip_state) if verdict.mip_state is not None else None,
            "n_states_evaluated": verdict.n_states_evaluated,
            "n_states_irreducible": verdict.n_states_irreducible,
            "phi_profile": [
                {"state": {"U": state[0], "A": state[1], "C": state[2]}, "phi": phi}
                for state, phi in verdict.phi_profile
            ],
        }
        print(f"{key}: {verdict.structure}  Φ_MIP max = {verdict.max_phi}  complex = {core}")

    variants = {}
    print("\nPersonalized variants (platform:adapts:alternatives)")
    for spec in variant_models():
        verdict = classify_rules(spec["rules"], labels=LABELS)
        core, core_phi = major_complex(spec["rules"], LABELS)
        core_list = list(core) if core else None
        variants[spec["key"]] = {
            "platform": spec["platform"],
            "adapts": spec["adapts"],
            "alternatives": spec["alternatives"],
            "phi": verdict.max_phi,
            "verdict": verdict.structure,
            "competence": verdict.competence,
            "major_complex": core_list,
            "major_complex_phi": None if core is None else core_phi,
            "u_in_major_complex": bool(core_list and "U" in core_list),
            "rules": spec["rules_text"],
            "mip_partition": verdict.mip_partition,
            "n_states_evaluated": verdict.n_states_evaluated,
            "n_states_irreducible": verdict.n_states_irreducible,
        }
        mark = "U in complex" if variants[spec["key"]]["u_in_major_complex"] else "U outside"
        print(
            f"{spec['key']:<28} {verdict.structure:<8} Φ={verdict.max_phi:<8} "
            f"complex={core_list}  {mark}"
        )

    payload = {
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "instrument": "PyPhi IIT-4.0 via algorithmacy-lab",
        "classifier": (
            "org_frontier.classifier.classify_rules — Φ over the minimum-information "
            "partition; triadic iff max Φ_MIP > 1e-9, else dyadic"
        ),
        "lab": "https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab",
        "pyphi": "pyphi @ git+https://github.com/wmayner/pyphi@feature/iit-4.0",
        "labels": list(LABELS),
        "label_meaning": {"U": "user", "A": "algorithm", "C": "counterpart"},
        "control_passed": True,
        "control_log": "phi/instrument_control.txt",
        "switches": {
            "adapts": "Q4 score >= 1 keeps the base rule for U; otherwise U'=U",
            "alternatives": "Q6 score == 2 sets C' = (base C) OR U; otherwise the base rule for C",
            "key": "platform:adapts:alternatives",
        },
        "platforms": platforms,
        "variants": variants,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
