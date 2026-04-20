# megawood Chatbot UX Conversion Plan

## Purpose
This plan defines what to improve in both chatbot variants to increase real conversion to dealer clicks.

- Variant 1: Classic chat widget (main website pages)
- Variant 2: Landscape chat + planner widget (terrace planner pages)

The primary business goal is dealer lead conversion. Planner and PDF export are supporting steps, not the final conversion.

## Product Goals

1. Increase dealer click conversion from chatbot sessions.
2. Reduce drop-off between first message and dealer intent.
3. Improve planning flow completion in landscape widget.
4. Keep AI-only journey (no human handoff).
5. Ensure desktop-first UX with mobile fullscreen support.
6. Keep German-first copy, but make language extension easy later.

## Target Users

1. Primary audience: normal consumers (families, homeowners).
2. Secondary premium audience: handymen, garden/landscape designers.
3. Audience model: mixed audience in one interface.

## Jobs To Be Done (JTBD)

### Consumer JTBD
When I want a terrace for my home, I want simple and reliable guidance on product and design options, so I can choose confidently and find a suitable dealer nearby.

### Pro JTBD
When I prepare or advise on a terrace project, I want fast access to specs and planning outputs, so I can progress the project and contact the right dealer quickly.

## Success Metrics

### North Star Metric
- Dealer Click Conversion Rate from chatbot sessions.

### Supporting Metrics
- Dealer flow start rate.
- Dealer location submit rate.
- Planner completion rate (landscape).
- PDF export rate (supporting only).
- Time to first meaningful action.
- Abandonment rate before first intent selection.

### Guardrail Metrics
- Error rate (chat and planner actions).
- Negative feedback rate (thumbs down).
- Average response latency.

## Funnel Definition

1. `chat_opened`
2. `entry_goal_selected`
3. `first_meaningful_action`
4. `recommendation_or_plan_created`
5. `dealer_flow_started`
6. `dealer_location_submitted`
7. `dealer_results_shown`
8. `dealer_click_completed` (primary conversion)

## Core UX Strategy

1. Route users by goal immediately after open.
2. Keep conversation short, guided, and action-oriented.
3. Offer context-aware quick prompts based on page type.
4. Make dealer CTA visible at high-intent moments.
5. For planner users, connect each completed step to dealer next step.

## Information Architecture

### Entry Goal Cards (first screen after open)

1. Produktberatung starten
2. Terrassenplanung starten
3. Bestehenden Planungscode nutzen
4. Haendler in meiner Naehe finden

### Path Selector (manual, always visible)

1. Ich bin Privatkunde
2. Ich plane beruflich

Note: User always selects path manually. Do not auto-force by page alone.

## Page Context Customization

### Start Page
- Default quick prompts focus on orientation and product discovery.
- Early CTA to dealer finder after recommendation confidence.

### Product Detail Pages
- Quick start prompts for normal customers (required).
- Prompts include product-specific questions (durability, color, care, price range).
- CTA: "Passenden Haendler fuer dieses Produkt finden".

### Terrace Planner Pages
- Quick start prompts focus on planning actions.
- After planning result or PDF export, prompt dealer next step.

## Variant-Specific UX Requirements

### Classic Widget

1. Keep compact and low-friction flow.
2. Show entry goal cards as first decision.
3. Present 3-5 quick replies max per turn.
4. Insert dealer CTA after meaningful recommendation.
5. Mobile mode must open fullscreen.

### Landscape Widget

1. Keep chat and planner synchronized.
2. Add explicit progress tracker:
   - Form
   - Dimensions
   - Product
   - Color
   - Save
   - Dealer
3. Confirm changes in both chat and side panel.
4. Keep dealer CTA sticky after save/PDF actions.
5. Tablet layout must preserve readability and CTA visibility.

## UX Copy Principles (German-first)

1. Use simple, confidence-building language for consumers.
2. Offer compact technical detail only when needed for pro users.
3. Every major step should include a next action.
4. Keep wording aligned with megawood brand tone.
5. Prepare copy for future i18n keys (no hard coupling to one language file).

## Mobile and Responsiveness

1. Desktop remains primary optimization target.
2. Mobile widget behavior:
   - Open in fullscreen.
   - Keep input and primary CTA always reachable.
   - Keep touch targets >= 44px.
3. Tablet behavior:
   - Planner remains usable without hidden critical controls.

## Event Tracking Specification (Matomo)

Track all events in Matomo with these dimensions:

- `widget_variant`: `classic` | `landscape`
- `audience_path`: `consumer` | `pro`
- `page_context`: `start` | `product_detail` | `planner`
- `device_class`: `desktop` | `tablet` | `mobile`
- `language`: `de`

### Event List

1. `chat_opened`
2. `entry_goal_selected`
3. `audience_path_selected`
4. `quick_prompt_clicked`
5. `message_sent`
6. `planner_code_loaded`
7. `planner_saved`
8. `pdf_export_clicked`
9. `dealer_flow_started`
10. `dealer_location_submitted`
11. `dealer_results_shown`
12. `dealer_click_completed`
13. `error_shown`

## Delivery Plan (Phased)

### Phase 0 - Baseline and Discovery (1 week)

1. Gather existing baseline data from Matomo/custom backend.
2. Confirm conversion definition = `dealer_click_completed`.
3. Document current drop-off per funnel step.

Deliverables:
- Baseline dashboard snapshot.
- Current funnel map.

### Phase 1 - Tracking Foundation (1 week)

1. Implement event instrumentation for all funnel steps.
2. Add required dimensions (`widget_variant`, `audience_path`, etc.).
3. Validate data quality in staging.

Deliverables:
- Event tracking implementation.
- Matomo dashboard v1.

### Phase 2 - Entry Flow Redesign (2 weeks)

1. Add entry goal cards.
2. Add manual audience path selector.
3. Add page-context quick start prompts.
4. Introduce fullscreen behavior for mobile.

Deliverables:
- New entry UX for classic and landscape.
- Prompt sets for start/product/planner contexts.

### Phase 3 - Dealer Conversion Layer (2 weeks)

1. Add consistent dealer CTA timing rules.
2. Add dealer flow mini-journey with clear steps.
3. Add post-recommendation and post-plan dealer prompts.

Deliverables:
- Dealer-first flow integrated in both widgets.
- Improved conversion checkpoints.

### Phase 4 - Planner UX Optimization (2 weeks)

1. Add progress tracker in landscape planner.
2. Add better status and error messages.
3. Add synchronized confirmations between chat and side panel.

Deliverables:
- Planner flow usability improvements.
- Reduced planner abandonment.

### Phase 5 - QA and Rollout Readiness (1-2 weeks)

1. Run desktop/mobile/tablet UX QA.
2. Validate accessibility basics.
3. Run moderated user tests with mixed audience.
4. Finalize launch checklist.

Deliverables:
- QA report.
- Rollout decision packet.

## Prioritized Backlog (Execution Order)

### P0 (Must-have)

1. Event tracking + Matomo dashboard.
2. Entry goal cards.
3. Audience path selector.
4. Dealer flow CTA framework.
5. Mobile fullscreen behavior.

### P1 (Should-have)

1. Product-page quick prompt templates.
2. Planner progress tracker.
3. Better planner error and success states.
4. Contextual recovery after unhelpful response.

### P2 (Could-have)

1. Expanded pro-focused prompt packs.
2. Additional persuasive microcopy tuning.
3. Future multilingual infrastructure hardening.

## Acceptance Criteria (By Capability)

### Entry Experience

1. User can select goal within first interaction without typing.
2. User can select consumer/pro path explicitly.
3. Prompt set changes by page context.

### Dealer Conversion

1. Dealer flow is reachable from every main path.
2. Dealer click completion is trackable end-to-end.
3. Dealer CTA appears after recommendation and after planning success.

### Planner Experience

1. Progress states are visible and understandable.
2. Save/load errors are actionable and human-readable.
3. Post-plan dealer step is clearly suggested.

### Mobile

1. Widget opens fullscreen on mobile.
2. Primary actions remain visible while typing.
3. No critical action requires horizontal scrolling.

### Localization Readiness

1. New user-facing copy is structured for easy language mapping later.
2. No new logic is tightly coupled to German strings.

## Open Points To Confirm Later

1. Current baseline values for funnel metrics.
2. Final thresholds for "success" per phase.
3. Exact prompt copy variants per product category.
4. Final dealer result click-out mechanics and attribution mapping.

## Suggested Working Rhythm

1. Weekly review of funnel data and UX findings.
2. Bi-weekly scope adjustment based on measured drop-off.
3. Keep one primary KPI per sprint: `dealer_click_completed` uplift.

## Implementation Notes (Issue #9)

### Frontend Prompt-Pack Architektur

Die Prompt-Packs sind zentral hinterlegt und nach `page_context` und `audience_path` strukturiert:

1. `src/config/promptPacks.ts`
2. `src/config/pageContext.ts`

Aktive Kontexte:

1. `start`
2. `product_detail`
3. `planner`

Aktive Zielgruppen:

1. `privatkunde`
2. `gewerblich`

Auswahl-Flow:

1. `embed.js` liest optional `data-page-context`.
2. Der Parameter wird als `page_context` in die Widget-URL geschrieben.
3. Die Entrypoints (`classic/main.tsx`, `landscape/main.tsx`) normalisieren den Kontext.
4. `ChatWidget` wählt die passenden Quick-Start-Prompts aus dem Prompt-Pack.
5. `useChat` übergibt `page_context` zusätzlich an das Backend.

### Backend-Kontextnutzung

Das Backend akzeptiert `page_context` in mehreren kompatiblen Formen:

1. Direkt: `page_context`
2. Genestet: `context.page_context`
3. Legacy-nah: `entry_context.page_context`

Normalisierte Zielwerte:

1. `start`
2. `product_detail`
3. `planner`

Der normalisierte Wert wird als kurze Guidance im Prompt-Kontext ergänzt, damit Woody je Seitentyp stärker auf Conversion-Pfade (insbesondere Dealer-Flow) ausgerichtet antwortet.

### Erweiterung um neuen page_context

1. Neuen Kontexttyp in `src/types/index.ts` ergänzen.
2. Alias/Normalisierung in `src/config/pageContext.ts` ergänzen.
3. Prompt-Sets für `privatkunde` und `gewerblich` in `src/config/promptPacks.ts` ergänzen.
4. Backend-Whitelist in `api/mw-chatbot-backend.py` erweitern (`ALLOWED_PAGE_CONTEXTS` + `PAGE_CONTEXT_ALIASES`).
5. Optional: `data-page-context` auf den Zielseiten anpassen.
