# WMI G1-G2 New Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 new G1/G2 concept generators and explainers.

**Architecture:** Each concept is a focused backend module under `api/services/wmi/concepts/<slug>/index.ts` with colocated tests. Frontend uses small shared explainers and registry wiring, preserving current WMI architecture.

**Tech Stack:** TypeScript, zod, Vitest, React, Framer Motion.

---

## Tasks

- [ ] Add backend modules/tests for A9, N14, P4, P5, W9, W10, N15, D3, L8, C5.
- [ ] Wire all new modules in `api/services/wmi/concepts/registry.ts`.
- [ ] Add domain and short ID mappings in `api/services/wmi/concepts/preview.ts`.
- [ ] Add lightweight frontend explainers and register them.
- [ ] Run new tests, concept gap check, typecheck, and lint.

## Self-Review

- Concepts are distinct from the existing 63.
- Difficulty is G1/G2 but slightly above current basics.
- No DB/schema changes are required.
