import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { NoteActionState } from "@/app/(portal)/tickets/actions";
import type { NoteWithComments } from "@/tickets/ticketRepository";
import { InternalNotes } from "./InternalNotes";

type AddNote = (state: NoteActionState, formData: FormData) => Promise<NoteActionState>;

function note(overrides: Partial<NoteWithComments>): NoteWithComments {
  return { id: 1, ticketId: 7, body: "Called the customer.", createdAt: new Date("2026-11-09T14:30:00Z"), comments: [], ...overrides };
}

function setup(notes: NoteWithComments[] = [], addNote: Mock<AddNote> = vi.fn<AddNote>(async () => undefined)) {
  const { container } = render(<InternalNotes ticketId={7} notes={notes} addNote={addNote} />);
  return { addNote, container };
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
