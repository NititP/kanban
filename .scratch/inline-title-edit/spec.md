# Inline Title edit on the Board

**Status:** ready-for-agent

## Problem Statement

Once a Card is on the Board, its Title cannot be changed. The only way to fix a typo or rename work is to delete the Card and add it again, which also throws away its status. Double-clicking the Title does nothing. Keyboard and mobile users have no way to rename a Card at all.

## Solution

A person can edit a Card's Title in place on the Board. Double-clicking the Title text, or pressing a small Edit control next to Delete, turns that Title into a single-line text box on the Card, already filled with the current Title. Enter or clicking away saves; Escape or an empty/whitespace-only Title cancels. Saves reuse the existing card update request. Failures look like move and delete failures: the old Title comes back and the error banner appears.

## User Stories

1. As a person using the Board, I want to change a Card's Title without deleting the Card, so that I can correct mistakes without losing status.
2. As a person using the Board, I want to double-click the Title text on a Card, so that I can start renaming without hunting for a control.
3. As a person using the Board, I want the Title to become a text box on that same Card, so that I stay on the Board and do not open a modal, details pane, or another page.
4. As a person using the Board, I want the text box pre-filled with the current Title, so that I can tweak wording instead of retyping from scratch.
5. As a person using the Board, I want the text box focused when it appears, so that I can type immediately.
6. As a person using the Board, I want to press Enter to save the new Title, so that I can finish with the keyboard.
7. As a person using the Board, I want clicking outside the text box to save the new Title, so that leaving the field finishes the edit.
8. As a person using the Board, I want to press Escape to cancel, so that I can abandon a rename without changing the Card.
9. As a person using the Board, I want cancelling to restore the last saved Title, so that a half-typed rename does not stick.
10. As a person using the Board, I want an empty Title to cancel instead of saving, so that a Card never ends up with no name.
11. As a person using the Board, I want a whitespace-only Title to cancel instead of saving, so that spaces do not become a Title.
12. As a person using the Board, I want a saved Title to be trimmed, so that accidental leading or trailing spaces match how new Cards are added.
13. As a person using the Board, I want the Title limited to 200 characters, so that rename matches the limit used when adding a Card.
14. As a person using the Board, I want the text box to refuse extra characters at 200, so that I cannot type a Title the server will reject for length.
15. As a person using the Board, I want a successful save to show the Title as ordinary text again, so that I can see the Card as a Card, not as a form.
16. As a person using the Board, I want the new Title visible on the Card as soon as I save, so that I do not wait on the network to know it worked.
17. As a person using the Board, I want a failed save to put the old Title back, so that the Board does not lie about what is stored.
18. As a person using the Board, I want a failed save to show the same error banner as a failed move or delete, so that errors feel consistent.
19. As a person using the Board, I want to dismiss that error banner, so that I can keep working after a failed rename.
20. As a person using the Board, I want renaming to leave the Card in its current column, so that a Title change is not a move.
21. As a person using the Board, I want to rename a Card in To do, Doing, or Done, so that Title edit is not limited to one status.
22. As a person using a keyboard, I want an Edit control next to Delete, so that I can start a Title edit without a mouse double-click.
23. As a person on a phone or tablet, I want that same Edit control, so that I can rename when double-click is awkward or unavailable.
24. As a person using the Board, I want Edit to open the same inline text box as double-click, so that there is only one way Title editing works.
25. As a person using the Board, I want Edit to be a small control, so that it does not compete with the Title or the move actions.
26. As a person using a screen reader, I want Edit to be announced as editing the Title, so that I know it is not a generic unnamed button.
27. As a person using the Board, I want only one Card in Title edit at a time, so that the Board does not fill with text boxes.
28. As a person using the Board, I want starting an edit on another Card to save the open edit (click-away), so that I do not lose a Title I already typed.
29. As a person using the Board, I want Cards I am not editing to stay draggable, so that I can still move work while glancing at Titles.
30. As a person using the Board, I want the Card I am editing to stop being draggable, so that selecting and typing in the text box does not start a drag.
31. As a person using the Board, I want double-clicking the Title to start an edit rather than a drag, so that rename is not stolen by drag-and-drop.
32. As a person using the Board, I want to select part of the Title in the text box, so that I can replace a word without rewriting the whole Title.
33. As a person using the Board, I want a single-line Title field, so that Enter saves and I cannot put newlines in a Title.
34. As a person using the Board, I want adding, moving, and deleting Cards to keep working during and after this feature, so that rename does not break the rest of the Board.
35. As a person using the Board, I want Delete to still remove the Card even if I could have edited its Title, so that rename does not replace delete.
36. As a person using the Board, I want a Title that I did not change (Enter on the same text) to leave the Card looking unchanged, so that a no-op edit is harmless.
37. As a person using the Board, I want a failed rename not to change the Card's status, so that an error cannot also move work.
38. As a person using the Board, I want to keep editing if I click inside the text box, so that ordinary typing is not treated as click-away.
39. As a person using the Board, I want the last saved Title to remain if I cancel after an earlier successful rename, so that Escape never rewinds past the last save.
40. As a person using the Board, I want the Title on every Card in a column to remain readable when none are being edited, so that the Board still scans as a list of names.

## Implementation Decisions

- Vocabulary: Board, Card, Title as in the glossary. Do not call Cards tickets, tasks, or issues. Do not call Title name, heading, or label.
- This is a Board behaviour change. The Card shape already has Title. No database or Card schema change.
- Reuse the existing partial update of a Card. Send only the new Title. Do not send status. Do not add a new endpoint.
- The client already knows how to update a Card for a move. Extend that update so it can send Title as well as status.
- Create already strips Title and caps it at 200 characters. Title edit must trim before save and cap at 200 the same way. The update endpoint does not strip; trimming is the client's job so stored Titles match create.
- The update endpoint rejects an empty Title. Never send empty or whitespace-only Titles; treat those as cancel.
- Optimistic Title update matches move and delete: change the Board immediately, then confirm with the server. On failure, restore the previous Title and set the same error banner already used when the API is unreachable or a request fails.
- Inline editor: a single-line text box on the Card being edited, replacing the Title text. Not a textarea. Not a modal. Not a details view.
- Two ways in: double-click on the Title text; a small Edit control in the Card actions next to Delete. Both open the same editor.
- Two ways to save: Enter; focus leaving the text box (click-away). After save, the Card shows Title as text again.
- Two ways to cancel: Escape; empty or whitespace-only content on an attempted save. Cancel restores the last saved Title and leaves the editor.
- While the text box is open, that Card is not draggable. Other Cards stay draggable as they are today.
- At most one Title editor open. Clicking away (including onto another Card or Edit) saves the open edit first, because click-away saves.
- Title-only updates must not change the Card's status or its place in the column.
- No new auth, no multi-user conflict UI, no history of previous Titles.

## Testing Decisions

- There are no tests in the repo today. This feature introduces the first Board tests.
- **Seam (one):** the Board as a person uses it. Stub the card API (list, create, move, remove, and the Title update). Drive the UI: double-click Title, Edit, type, Enter, Escape, click-away, empty Title, whitespace, trim, 200-character cap, drag while editing vs not, failed update. Assert what is on screen and what the stubbed API was asked to do.
- Do not add a second seam. Do not unit-test editor internals, React state, or DOM implementation details. Do not add backend tests for Title on the existing update endpoint; that contract already exists.
- A good test only checks external behaviour: the Title a person sees, whether the text box is open, whether a Card is draggable, and the payload sent to the stubbed API. Tests must not inspect private component state or CSS class names unless those names are the only accessible signal (prefer roles, labels, and text).
- Prior art: none. Match the Board's existing visible language (New card title, Delete, column names, error banner) so tests stay coupled to user-facing names rather than structure.

## Out of Scope

- Changing how Cards are added, moved, or deleted, except that Title update shares the existing error banner and optimistic pattern.
- A Card details page, modal, or any editor that is not inline on the Card.
- Rich text, markdown, descriptions, comments, assignees, due dates, or any field other than Title.
- Newlines in Titles.
- Backend or database schema changes; a new update endpoint; sending status together with Title.
- Multiplayer, locking, or last-write-wins UI beyond the existing failed-request banner.
- Undo history beyond Escape restoring the last saved Title for the in-progress edit.
- Changing drag-and-drop for Cards that are not being edited.
- Auth, permissions, or per-person edit rights (the Board is single-user).

## Further Notes

- Glossary: `GLOSSARY.md` (Board, Card, Title). No ADR for this feature.
- Empty/whitespace cancel is a product rule and also keeps the client from sending a Title the update endpoint would reject (`min_length=1`).
- Create strips Title; update does not. Client-side trim is how those two stay consistent.
