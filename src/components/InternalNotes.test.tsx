import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { NoteActionState } from "@/app/(portal)/tickets/actions";
import type { TicketNoteComment } from "@/db/schema";
import type { NoteWithComments } from "@/tickets/ticketRepository";
import { InternalNotes } from "./InternalNotes";

type AddNote = (state: NoteActionState, formData: FormData) => Promise<NoteActionState>;

function note(overrides: Partial<NoteWithComments>): NoteWithComments {
  return { id: 1, ticketId: 7, body: "Called the customer.", createdAt: new Date("2026-11-09T14:30:00Z"), comments: [], ...overrides };
}

function comment(overrides: Partial<TicketNoteComment>): TicketNoteComment {
  return { id: 1, noteId: 1, body: "Thanks!", createdAt: new Date("2026-11-09T15:00:00Z"), ...overrides };
}

function setup(
  notes: NoteWithComments[] = [],
  addNote: Mock<AddNote> = vi.fn<AddNote>(async () => undefined),
  addNoteComment: Mock<AddNote> = vi.fn<AddNote>(async () => undefined),
) {
  const ui = (list: NoteWithComments[]) => (
    <InternalNotes ticketId={7} notes={list} addNote={addNote} addNoteComment={addNoteComment} />
  );
  const view = render(ui(notes));
  return { addNote, addNoteComment, container: view.container, rerender: (list: NoteWithComments[]) => view.rerender(ui(list)) };
}

const addButton = () => screen.getByRole("button", { name: "Add note" });

describe("InternalNotes", () => {
  it("has the heading Internal notes and a note form, also without notes", () => {
    setup();

    expect(screen.getByRole("heading", { level: 2, name: "Internal notes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Note")).toBeInTheDocument();
    expect(addButton()).toBeEnabled();
  });

  it("shows no list and no empty-state text when there are no notes", () => {
    setup();

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Internal notes" })).toHaveTextContent(/^Internal notes\s*Note\s*Add note$/);
  });

  it("shows the note text with its date and time in UTC", () => {
    setup([note({})]);

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("Called the customer.")).toBeInTheDocument();
    expect(within(item).getByText("Nov 9, 2026, 2:30 PM")).toBeInTheDocument();
  });

  it("shows the notes in the order they are given", () => {
    setup([note({ id: 2, body: "Newer" }), note({ id: 1, body: "Older" })]);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Newer");
    expect(items[1]).toHaveTextContent("Older");
  });

  it("keeps line breaks and wraps long words", () => {
    setup([note({ body: "line one\nline two" })]);

    const text = screen.getByText(/line one/);
    expect(text.textContent).toBe("line one\nline two");
    expect(text).toHaveClass("whitespace-pre-wrap", "wrap-break-word");
  });

  it("shows HTML in a note as text", () => {
    const html = "<b>x</b> <script>alert(1)</script>";
    const { container } = setup([note({ body: html })]);

    expect(screen.getByText(html)).toBeInTheDocument();
    expect(container.querySelector("b, script")).toBeNull();
  });

  it("does not turn a URL in a note into a link", () => {
    setup([note({ body: "See https://example.com/path for details" })]);

    expect(screen.getByText(/https:\/\/example\.com\/path/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("limits the note to 500 characters", () => {
    setup();

    expect(screen.getByLabelText("Note")).toHaveAttribute("maxlength", "500");
  });

  it("sends the ticket id and the text to the action", async () => {
    const { addNote } = setup();

    await userEvent.type(screen.getByLabelText("Note"), "Called the customer");
    await userEvent.click(addButton());

    expect(Object.fromEntries(addNote.mock.calls[0]![1])).toEqual({ ticketId: "7", body: "Called the customer" });
  });

  it("empties the form and clears the error after a successful save", async () => {
    const addNote = vi
      .fn<AddNote>()
      .mockResolvedValueOnce({ value: "Call", error: "Please write a note." })
      .mockResolvedValueOnce({ value: "", saved: true });
    setup([], addNote);

    await userEvent.type(screen.getByLabelText("Note"), "Call");
    await userEvent.click(addButton());
    expect(await screen.findByText("Please write a note.")).toBeInTheDocument();

    await userEvent.click(addButton());

    await waitFor(() => expect(screen.getByLabelText("Note")).toHaveValue(""));
    expect(screen.queryByText("Please write a note.")).not.toBeInTheDocument();
  });

  it("disables the button while the note is being saved", async () => {
    let finish!: () => void;
    const addNote = vi.fn<AddNote>(
      () => new Promise((resolve) => { finish = () => resolve({ value: "", saved: true }); }),
    );
    setup([], addNote);

    await userEvent.type(screen.getByLabelText("Note"), "Slow note");
    await userEvent.click(addButton());
    expect(addButton()).toBeDisabled();

    await act(async () => finish());
    await waitFor(() => expect(addButton()).toBeEnabled());
  });

  it("shows the error next to the textarea and keeps the typed text", async () => {
    const message = "Note must be at most 500 characters.";
    const addNote = vi.fn<AddNote>(async () => ({ value: "Keep me", error: message }));
    setup([], addNote);

    await userEvent.type(screen.getByLabelText("Note"), "Keep me");
    await userEvent.click(addButton());

    const textarea = await screen.findByLabelText("Note");
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(textarea).toHaveAccessibleDescription(message);
    expect(textarea).toHaveValue("Keep me");
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });

  it("shows the ticket alert at the top of the section and keeps the typed text", async () => {
    const message = "This ticket no longer exists. Go back to the ticket list.";
    const addNote = vi.fn<AddNote>(async () => ({ value: "Hello", alert: message }));
    setup([], addNote);

    await userEvent.type(screen.getByLabelText("Note"), "Hello");
    await userEvent.click(addButton());

    const alert = await screen.findByRole("alert");
    await waitFor(() => expect(alert).toHaveTextContent(message));
    const textarea = screen.getByLabelText("Note");
    expect(textarea).toHaveValue("Hello");
    expect(alert.compareDocumentPosition(textarea) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("has an empty alert area at first", () => {
    setup();

    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });
});

const noteItem = (body: string) => screen.getByText(body).closest("li")!;
const toggle = (item: HTMLElement) => within(item).getByRole("button", { name: /^Comments \(\d+\)$/ });
const openNote = (body: string) => userEvent.click(toggle(noteItem(body)));

describe("InternalNotes comments", () => {
  it("shows the number of comments on each note's button", () => {
    setup([
      note({ id: 1, body: "Zero" }),
      note({ id: 2, body: "One", comments: [comment({ id: 1, noteId: 2 })] }),
      note({ id: 3, body: "Three", comments: [comment({ id: 2, noteId: 3 }), comment({ id: 3, noteId: 3 }), comment({ id: 4, noteId: 3 })] }),
    ]);

    expect(toggle(noteItem("Zero"))).toHaveAccessibleName("Comments (0)");
    expect(toggle(noteItem("One"))).toHaveAccessibleName("Comments (1)");
    expect(toggle(noteItem("Three"))).toHaveAccessibleName("Comments (3)");
  });

  it("hides the comments and the comment form when the page loads", () => {
    setup([note({ body: "Parent", comments: [comment({ body: "Hidden reply" })] })]);

    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden reply")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument();
  });

  it("opens and closes the comments when the button is clicked", async () => {
    setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })]);

    await openNote("Parent");
    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("A reply")).toBeInTheDocument();
    expect(screen.getByLabelText("Comment")).toBeInTheDocument();

    await openNote("Parent");
    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("A reply")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument();
  });

  it("can be reached and used with the keyboard", async () => {
    setup([note({ body: "Parent" })]);
    const button = toggle(noteItem("Parent"));

    for (let i = 0; i < 5 && document.activeElement !== button; i++) await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the comments in the order given, each with its date and time in UTC", async () => {
    setup([
      note({
        body: "Parent",
        comments: [
          comment({ id: 1, body: "First", createdAt: new Date("2026-11-09T15:00:00Z") }),
          comment({ id: 2, body: "Second", createdAt: new Date("2026-11-10T08:05:00Z") }),
        ],
      }),
    ]);
    await openNote("Parent");

    const replies = within(noteItem("Parent")).getAllByRole("listitem");
    expect(replies[0]).toHaveTextContent("First");
    expect(within(replies[0]!).getByText("Nov 9, 2026, 3:00 PM")).toBeInTheDocument();
    expect(replies[1]).toHaveTextContent("Second");
    expect(within(replies[1]!).getByText("Nov 10, 2026, 8:05 AM")).toBeInTheDocument();
  });

  it("shows a comment only under its own note", async () => {
    setup([
      note({ id: 1, body: "Note A", comments: [comment({ id: 1, noteId: 1, body: "Reply to A" })] }),
      note({ id: 2, body: "Note B", comments: [comment({ id: 2, noteId: 2, body: "Reply to B" })] }),
    ]);

    await openNote("Note A");
    expect(within(noteItem("Note A")).getByText("Reply to A")).toBeInTheDocument();
    expect(screen.queryByText("Reply to B")).not.toBeInTheDocument();

    await openNote("Note B");
    expect(within(noteItem("Note B")).getByText("Reply to B")).toBeInTheDocument();
    expect(within(noteItem("Note A")).queryByText("Reply to B")).not.toBeInTheDocument();
  });

  it("shows comment text as plain text", async () => {
    const body = "<b>x</b> see https://example.com/x\nnext line";
    const { container } = setup([note({ body: "Parent", comments: [comment({ body })] })]);
    await openNote("Parent");

    const text = screen.getByText(/<b>x<\/b> see/);
    expect(text.textContent).toBe(body);
    expect(text).toHaveClass("whitespace-pre-wrap", "wrap-break-word");
    expect(container.querySelector("b, script")).toBeNull();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("has a labelled comment textarea limited to 500 characters and an Add comment button", async () => {
    setup([note({ body: "Parent" })]);
    await openNote("Parent");

    const item = noteItem("Parent");
    expect(within(item).getByLabelText("Comment")).toHaveAttribute("maxlength", "500");
    expect(within(item).getByRole("button", { name: "Add comment" })).toBeEnabled();
  });

  it("sends the note id and the text to the action", async () => {
    const { addNoteComment } = setup([note({ id: 5, body: "Parent" })]);
    await openNote("Parent");

    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Thanks");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    expect(Object.fromEntries(addNoteComment.mock.calls[0]![1])).toEqual({ noteId: "5", body: "Thanks" });
  });

  it("empties the comment form, stays open and shows the new count after a save", async () => {
    const addNoteComment = vi.fn<AddNote>(async () => ({ value: "", saved: true }));
    const parent = note({ id: 5, body: "Parent" });
    const { rerender } = setup([parent], undefined, addNoteComment);
    await openNote("Parent");

    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Thanks");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(within(noteItem("Parent")).getByLabelText("Comment")).toHaveValue(""));
    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "true");

    rerender([{ ...parent, comments: [comment({ id: 9, noteId: 5, body: "Thanks" })] }]);
    expect(toggle(noteItem("Parent"))).toHaveAccessibleName("Comments (1)");
    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "true");
    expect(within(noteItem("Parent")).getByText("Thanks")).toBeInTheDocument();
  });

  it("disables Add comment while the comment is being saved", async () => {
    let finish!: () => void;
    const addNoteComment = vi.fn<AddNote>(
      () => new Promise<NoteActionState>((resolve) => { finish = () => resolve({ value: "", saved: true }); }),
    );
    setup([note({ body: "Parent" })], undefined, addNoteComment);
    await openNote("Parent");
    const addCommentButton = () => within(noteItem("Parent")).getByRole("button", { name: "Add comment" });

    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Slow");
    await userEvent.click(addCommentButton());
    expect(addCommentButton()).toBeDisabled();

    await act(async () => finish());
    await waitFor(() => expect(addCommentButton()).toBeEnabled());
  });

  it("shows the error next to the comment textarea and keeps the typed text", async () => {
    const message = "Comment must be at most 500 characters.";
    const addNoteComment = vi.fn<AddNote>(async () => ({ value: "Keep me", error: message }));
    setup([note({ body: "Parent" })], undefined, addNoteComment);
    await openNote("Parent");

    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Keep me");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    const textarea = within(noteItem("Parent")).getByLabelText("Comment");
    expect(textarea).toHaveAccessibleDescription(message);
    expect(textarea).toHaveValue("Keep me");
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });

  it("shows the note alert in the alert area when the note is gone", async () => {
    const message = "This note no longer exists.";
    const addNoteComment = vi.fn<AddNote>(async () => ({ value: "Reply", alert: message }));
    setup([note({ body: "Parent" })], undefined, addNoteComment);
    await openNote("Parent");

    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Reply");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message));
  });

  it("keeps the text in the note form when a comment is saved", async () => {
    const addNoteComment = vi.fn<AddNote>(async () => ({ value: "", saved: true }));
    setup([note({ body: "Parent" })], undefined, addNoteComment);
    await openNote("Parent");

    await userEvent.type(screen.getByLabelText("Note"), "Draft note");
    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Thanks");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(within(noteItem("Parent")).getByLabelText("Comment")).toHaveValue(""));
    expect(screen.getByLabelText("Note")).toHaveValue("Draft note");
  });

  it("keeps the alert when a comments section is opened or closed", async () => {
    const message = "This ticket no longer exists. Go back to the ticket list.";
    const addNote = vi.fn<AddNote>(async () => ({ value: "x", alert: message }));
    setup([note({ body: "Parent" })], addNote);

    await userEvent.type(screen.getByLabelText("Note"), "x");
    await userEvent.click(addButton());
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message));

    await openNote("Parent");
    await openNote("Parent");

    expect(screen.getByRole("alert")).toHaveTextContent(message);
  });

  it("clears an earlier alert when a comment is saved", async () => {
    const addNote = vi.fn<AddNote>(async () => ({ value: "x", alert: "This ticket no longer exists. Go back to the ticket list." }));
    const addNoteComment = vi.fn<AddNote>(async () => ({ value: "", saved: true }));
    setup([note({ body: "Parent" })], addNote, addNoteComment);

    await userEvent.type(screen.getByLabelText("Note"), "x");
    await userEvent.click(addButton());
    await waitFor(() => expect(screen.getByRole("alert")).not.toBeEmptyDOMElement());

    await openNote("Parent");
    await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), "Thanks");
    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeEmptyDOMElement());
  });
});
