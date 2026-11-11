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
  deleteNote: Mock<AddNote> = vi.fn<AddNote>(async () => ({})),
  deleteNoteComment: Mock<AddNote> = vi.fn<AddNote>(async () => ({})),
) {
  const ui = (list: NoteWithComments[]) => (
    <InternalNotes
      ticketId={7}
      notes={list}
      addNote={addNote}
      addNoteComment={addNoteComment}
      deleteNote={deleteNote}
      deleteNoteComment={deleteNoteComment}
    />
  );
  const view = render(ui(notes));
  return {
    addNote,
    addNoteComment,
    deleteNote,
    deleteNoteComment,
    container: view.container,
    rerender: (list: NoteWithComments[]) => view.rerender(ui(list)),
  };
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

const commentItem = (text: string) => screen.getByText(text).closest("li")!;
const click = (element: HTMLElement) => userEvent.click(element);

describe("InternalNotes delete", () => {
  it("gives every note and every open comment a delete button", async () => {
    setup([
      note({ id: 1, body: "One", comments: [comment({ id: 1, noteId: 1, body: "c1" }), comment({ id: 2, noteId: 1, body: "c2" })] }),
      note({ id: 2, body: "Two" }),
    ]);

    expect(within(noteItem("One")).getByRole("button", { name: "Delete note" })).toHaveTextContent("Delete");
    expect(within(noteItem("Two")).getByRole("button", { name: "Delete note" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete comment" })).not.toBeInTheDocument();

    await openNote("One");
    expect(within(noteItem("One")).getAllByRole("button", { name: "Delete comment" })).toHaveLength(2);
  });

  it("asks for confirmation before deleting a note and does not call the action yet", async () => {
    const { deleteNote } = setup([note({ body: "Parent" })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));

    expect(within(noteItem("Parent")).getByRole("button", { name: "Confirm delete" })).toBeInTheDocument();
    expect(within(noteItem("Parent")).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete note" })).not.toBeInTheDocument();
    expect(deleteNote).not.toHaveBeenCalled();
  });

  it("warns that one comment is deleted too", async () => {
    setup([note({ body: "Parent", comments: [comment({ noteId: 1 })] })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));

    expect(screen.getByText("This also deletes 1 comment.")).toBeInTheDocument();
  });

  it("warns how many comments are deleted too", async () => {
    setup([note({ body: "Parent", comments: [comment({ id: 1 }), comment({ id: 2 }), comment({ id: 3 })] })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));

    expect(screen.getByText("This also deletes 3 comments.")).toBeInTheDocument();
  });

  it("shows no warning for a note without comments", async () => {
    setup([note({ body: "Parent" })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));

    expect(screen.queryByText(/This also deletes/)).not.toBeInTheDocument();
  });

  it("sends the note id to the action when the delete is confirmed", async () => {
    const { deleteNote } = setup([note({ id: 4, body: "Parent" })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));
    await click(within(noteItem("Parent")).getByRole("button", { name: "Confirm delete" }));

    expect(Object.fromEntries(deleteNote.mock.calls[0]![1])).toEqual({ noteId: "4" });
  });

  it("goes back to the single Delete button when a note delete is cancelled", async () => {
    const { deleteNote } = setup([note({ body: "Parent", comments: [comment({})] })]);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));
    await click(within(noteItem("Parent")).getByRole("button", { name: "Cancel" }));

    expect(within(noteItem("Parent")).getByRole("button", { name: "Delete note" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument();
    expect(screen.queryByText(/This also deletes/)).not.toBeInTheDocument();
    expect(deleteNote).not.toHaveBeenCalled();
  });

  it("asks for confirmation before deleting a comment, without a warning", async () => {
    const { deleteNoteComment } = setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })]);
    await openNote("Parent");

    await click(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" }));

    expect(within(commentItem("A reply")).getByRole("button", { name: "Confirm delete" })).toBeInTheDocument();
    expect(within(commentItem("A reply")).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.queryByText(/This also deletes/)).not.toBeInTheDocument();
    expect(deleteNoteComment).not.toHaveBeenCalled();
  });

  it("sends the comment id to the action when the delete is confirmed", async () => {
    const { deleteNoteComment } = setup([note({ body: "Parent", comments: [comment({ id: 8, body: "A reply" })] })]);
    await openNote("Parent");

    await click(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" }));
    await click(within(commentItem("A reply")).getByRole("button", { name: "Confirm delete" }));

    expect(Object.fromEntries(deleteNoteComment.mock.calls[0]![1])).toEqual({ commentId: "8" });
  });

  it("goes back to the Delete button when a comment delete is cancelled", async () => {
    const { deleteNoteComment } = setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })]);
    await openNote("Parent");

    await click(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" }));
    await click(within(commentItem("A reply")).getByRole("button", { name: "Cancel" }));

    expect(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" })).toBeInTheDocument();
    expect(deleteNoteComment).not.toHaveBeenCalled();
  });

  it("lets a note and one of its comments be in the confirm step at once", async () => {
    setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })]);
    await openNote("Parent");
    const parent = noteItem("Parent");
    const reply = commentItem("A reply");
    const noteConfirms = () => within(parent).getAllByRole("button", { name: "Confirm delete" }).filter((b) => !reply.contains(b));

    await click(within(parent).getByRole("button", { name: "Delete note" }));
    await click(within(reply).getByRole("button", { name: "Delete comment" }));
    expect(noteConfirms()).toHaveLength(1);
    expect(within(reply).getByRole("button", { name: "Confirm delete" })).toBeInTheDocument();

    await click(within(reply).getByRole("button", { name: "Cancel" }));
    expect(within(reply).getByRole("button", { name: "Delete comment" })).toBeInTheDocument();
    expect(noteConfirms()).toHaveLength(1);
  });

  it("shows the new count and keeps the note and the other comment after a comment is deleted", async () => {
    const parent = note({ id: 1, body: "Parent", comments: [comment({ id: 1, body: "Goes" }), comment({ id: 2, body: "Stays" })] });
    const { rerender } = setup([parent]);
    await openNote("Parent");

    rerender([{ ...parent, comments: [parent.comments[1]!] }]);

    expect(toggle(noteItem("Parent"))).toHaveAccessibleName("Comments (1)");
    expect(toggle(noteItem("Parent"))).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Stays")).toBeInTheDocument();
    expect(screen.queryByText("Goes")).not.toBeInTheDocument();
  });

  it("disables the confirm button while the delete runs", async () => {
    let finish!: () => void;
    const deleteNote = vi.fn<AddNote>(() => new Promise<NoteActionState>((resolve) => { finish = () => resolve({}); }));
    setup([note({ body: "Parent" })], undefined, undefined, deleteNote);
    const control = () => within(noteItem("Parent")).getByRole("button", { name: /Confirm delete|Delete note/ });

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));
    await click(within(noteItem("Parent")).getByRole("button", { name: "Confirm delete" }));
    expect(control()).toBeDisabled();

    await act(async () => finish());
    await waitFor(() => expect(control()).toBeEnabled());
  });

  it("shows the note alert when the note is already gone", async () => {
    const deleteNote = vi.fn<AddNote>(async () => ({ alert: "This note no longer exists." }));
    setup([note({ body: "Parent" })], undefined, undefined, deleteNote);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));
    await click(within(noteItem("Parent")).getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("This note no longer exists."));
  });

  it("shows the comment alert when the comment is already gone", async () => {
    const deleteNoteComment = vi.fn<AddNote>(async () => ({ alert: "This comment no longer exists." }));
    setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })], undefined, undefined, undefined, deleteNoteComment);
    await openNote("Parent");

    await click(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" }));
    await click(within(commentItem("A reply")).getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("This comment no longer exists."));
  });

  it("clears an earlier alert when the next delete succeeds", async () => {
    const deleteNote = vi.fn<AddNote>(async () => ({ alert: "This note no longer exists." }));
    const deleteNoteComment = vi.fn<AddNote>(async () => ({}));
    setup([note({ body: "Parent", comments: [comment({ body: "A reply" })] })], undefined, undefined, deleteNote, deleteNoteComment);

    await click(within(noteItem("Parent")).getByRole("button", { name: "Delete note" }));
    await click(within(noteItem("Parent")).getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(screen.getByRole("alert")).not.toBeEmptyDOMElement());

    await openNote("Parent");
    await click(within(commentItem("A reply")).getByRole("button", { name: "Delete comment" }));
    await click(within(commentItem("A reply")).getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeEmptyDOMElement());
  });
});

async function submitCommentError(message: string, typed = "Keep me") {
  const addNoteComment = vi.fn<AddNote>(async () => ({ value: typed, error: message }));
  setup([note({ body: "Parent" })], undefined, addNoteComment);
  await openNote("Parent");
  await userEvent.type(within(noteItem("Parent")).getByLabelText("Comment"), typed);
  await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));
  expect(await screen.findByText(message)).toBeInTheDocument();
  return addNoteComment;
}

const clickOutside = () => userEvent.click(screen.getByRole("heading", { level: 2, name: "Internal notes" }));

describe("InternalNotes error messages go away", () => {
  const commentMessage = "Please write a comment.";
  const noteMessage = "Please write a note.";

  it("hides the comment error when the comments are closed, and keeps the text", async () => {
    await submitCommentError(commentMessage);

    await openNote("Parent");
    await openNote("Parent");

    expect(screen.queryByText(commentMessage)).not.toBeInTheDocument();
    expect(within(noteItem("Parent")).getByLabelText("Comment")).toHaveValue("Keep me");
  });

  it("hides the comment error when the handler clicks outside the textarea, and keeps the text", async () => {
    await submitCommentError(commentMessage);

    await clickOutside();

    expect(screen.queryByText(commentMessage)).not.toBeInTheDocument();
    const textarea = within(noteItem("Parent")).getByLabelText("Comment");
    expect(textarea).toHaveValue("Keep me");
    expect(textarea).not.toHaveAttribute("aria-describedby");
  });

  it("hides the comment error when the handler starts typing", async () => {
    await submitCommentError(commentMessage);

    await userEvent.keyboard("x");

    expect(screen.queryByText(commentMessage)).not.toBeInTheDocument();
    expect(within(noteItem("Parent")).getByLabelText("Comment")).toHaveValue("Keep mex");
  });

  it("shows the comment error again after a new failed submit", async () => {
    await submitCommentError(commentMessage);
    await clickOutside();
    expect(screen.queryByText(commentMessage)).not.toBeInTheDocument();

    await userEvent.click(within(noteItem("Parent")).getByRole("button", { name: "Add comment" }));

    expect(await screen.findByText(commentMessage)).toBeInTheDocument();
  });

  it("puts focus in the comment textarea when an error is shown", async () => {
    await submitCommentError(commentMessage);

    await waitFor(() => expect(within(noteItem("Parent")).getByLabelText("Comment")).toHaveFocus());
  });

  describe("note form", () => {
    async function submitNoteError() {
      const addNote = vi.fn<AddNote>(async () => ({ value: "Keep me", error: noteMessage }));
      setup([], addNote);
      await userEvent.type(screen.getByLabelText("Note"), "Keep me");
      await userEvent.click(addButton());
      expect(await screen.findByText(noteMessage)).toBeInTheDocument();
    }

    it("puts focus in the textarea when an error is shown", async () => {
      await submitNoteError();

      await waitFor(() => expect(screen.getByLabelText("Note")).toHaveFocus());
    });

    it("hides the error when the handler clicks outside, and keeps the text", async () => {
      await submitNoteError();

      await clickOutside();

      expect(screen.queryByText(noteMessage)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Note")).toHaveValue("Keep me");
      expect(screen.getByLabelText("Note")).not.toHaveAttribute("aria-describedby");
    });

    it("hides the error when the handler starts typing", async () => {
      await submitNoteError();

      await userEvent.keyboard("x");

      expect(screen.queryByText(noteMessage)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Note")).toHaveValue("Keep mex");
    });

    it("shows the error again after a new failed submit", async () => {
      await submitNoteError();
      await clickOutside();
      expect(screen.queryByText(noteMessage)).not.toBeInTheDocument();

      await userEvent.click(addButton());

      expect(await screen.findByText(noteMessage)).toBeInTheDocument();
    });
  });

  it("leaves the alert area alone when an error is dismissed", async () => {
    const alert = "This ticket no longer exists. Go back to the ticket list.";
    const addNote = vi.fn<AddNote>(async () => ({ value: "x", error: noteMessage, alert }));
    setup([], addNote);
    await userEvent.type(screen.getByLabelText("Note"), "x");
    await userEvent.click(addButton());
    expect(await screen.findByText(noteMessage)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(alert);

    await clickOutside();

    expect(screen.queryByText(noteMessage)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(alert);
  });
});
