# Documented User Consultation

This document records the user consultations carried out during the development of **PubTrail**. It covers two stages:

1. Prototyping stage consultation (~30 min)
2. Formative evaluation stage consultation (~30 min)

Both sessions were conducted the same two participants in a single sitting so that the feedback could be compared directly between the early prototype and the working formative build.

---

## Participants

| #  | Background                                                    | Role in session            |
| --- | --------------------------------------------------------------------- | -------------------------- |
| P1  | Full‑stack developer (Java / Angular Developer in Banking Industry)   | Tech‑savvy reviewer        |
| P2  | Student at Försvarshögskolan, no software background                  | Non‑technical end user     |

P1 catches structure and interaction issues, while P2 represents the realistic target user (a student going on a pub crawl with friends) and exposes anything that "only makes sense to a developer".

---

## 1. Prototyping‑stage consultation

**Date:** 2026‑04‑21
**Duration:** ~30 minutes
**Format:** in‑person, low prototype on a phone + Figma‑style sketches on screen.

At this point the app we were still unsure if we want to proceed with map-first approach and the app had two navigation ideas. The goal of this session was to decide between them before we continue with the implementation of the other features in the app.

### The design question

We had two great ideas and were undecisive which one to proceed with:
- **A. Map‑on‑demand.** The home screen and the crawl screen are list- or button-bawsed; the map only appears on dedicated screens
- **B. Map‑first.** The map is the primary surface of the app, always visible.  Mental model: Uber / Bolt / Google Maps.

We explicitly wanted user feedback *before* locking in the architecture.

### How the session was run

1. **Warm‑up (5 min).** Asked each participant to describe how they imagine "an app to plan a pub crawl with friends" should look. We did not show any screens yet.
2. **Walk‑through of variant A, screen‑first (10 min).** 
3. **Walk‑through of variant B, map‑first (10 min).**
4. **Comparison & ranking (5 min).** Side‑by‑side. Which one feels more like "an app you woudl actually open on a Friday night?"
5. **Open feedback (<5 min).** Anything missing, confusing...

### What the participants said

**P2 (non‑tech, Försvarshögskolan):**

- In the warm‑up, *spontaneously* described the app as "like Uber but with bars on it". This was a strong signal before we showed anything.
- On variant A: "Why do I have to press a button to see where the bar is? That's the whole point." 
- On variant B: "Yes, this one. I can see where I am, where the next bar is, and how far it is." 
- She was worried that at night a fully bright map "will blind everyone in the bar" so she asked for a dark mode support.

**P1 (full‑stack dev):**

- Agreed that map‑first matches user expectations and previous experience from Uber/Bolt and reduces the number of screens to maintain.
- Flagged a risk if the map is always mounted, we must be careful with re‑renders, location subscriptions and Mapbox lifecycle otherwise the app will drain battery.


### Decision taken from this session

**Adopt the map‑first approach (variant B).** Both users agreed on it.


---

## 2. Formative‑evaluation‑stage consultation

**Date:** 2026‑05‑02
**Duration:** ~30 minutes
**Format:** task‑based usability test on the working app. Participants performed real tasks; we observed and asked follow‑up questions afterwards. 

### Tasks given

1. Sign in with Google
2. Create a new crawl, add 3 stops
3. Start the crawl, mark the first stop as visited, add a photo
4. Open a past crawl and inspect one of its stops
5. Share the crawl with the other participant via QR code
6. Take a photo and save it in the app

### Observations & quotes

**P2 (non‑tech):**

- Completed all five tasks without any problem
- Liked seeing previous stops

**P1 (full‑stack dev):**

- Confirmed that the map‑first implementation paid off. Navigation really feels "one app" instead of "a bunch of screens" seh said.
- Caught a concrete bug during testing: stop dates were not being saved for drafts
- Suggested the input area should sit nicely above the keyboard on small Android phones

## Conclusion

- The **prototyping** consultation really answered a real architectural question before we wrote the code
- The **formative** consultation helped us with in‑progress build. It discovered a bug (draft stop dates not saving), small UX fixes and confirmed that the map‑first model holds up under real tasks.
- Having one technical and one non‑technical participant in the same session was deliberately useful
