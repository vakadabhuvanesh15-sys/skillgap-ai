---
name: Third-party analytics
description: Provider choice and safety boundary for SkillGap AI custom events.
---

SkillGap AI should keep custom event tracking optional and provider-agnostic in development and preview builds. PostHog is the best default when the product needs funnels and event properties; Plausible is a lighter privacy-first alternative.

**Why:** Replit-hosted analytics is unavailable for this project, and the student demo must not require a provider SDK, secret, or network availability to render or complete an action.

**How to apply:** Route future events through the shared optional bridge, send only static/non-PII dimensions such as career, source location, action type, milestone, project, or task IDs, and configure the selected provider separately before publishing.