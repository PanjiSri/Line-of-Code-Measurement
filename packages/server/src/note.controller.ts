import { TRPCError } from "@trpc/server";
import { notesTable, runQuery } from "./spannerClient";
import crypto from "crypto";
import {
  CreateNoteInput,
  FilterQueryInput,
  ParamsInput,
  UpdateNoteInput,
} from "./note.schema";

const nowISO = () => new Date().toISOString();

export const createNoteController = async ({
  input,
}: {
  input: CreateNoteInput;
}) => {
  const row = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
    category: input.category ?? null,
    published: input.published ?? false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  try {
    await notesTable.insert([row]);
  } catch (e: any) {
    if (e.code === 6) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Note with that title already exists",
      });
    }
    throw e;
  }

  return { status: "success", data: { note: row } };
};

export const updateNoteController = async ({
  paramsInput,
  input,
}: {
  paramsInput: ParamsInput;
  input: UpdateNoteInput["body"];
}) => {
  const newRow = { ...input, updatedAt: nowISO(), id: paramsInput.noteId };

  try {
    await notesTable.update([newRow]);
  } catch (e: any) {
    if (e.code === 6) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Note with that title already exists",
      });
    }
    throw e;
  }

  return { status: "success", note: newRow };
};

export const findNoteController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  const [rows] = await runQuery({
    sql: "SELECT * FROM notes WHERE id=@id",
    params: { id: paramsInput.noteId },
  });

  const note = rows[0]?.toJSON?.();
  if (!note) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
  }
  return { status: "success", note };
};

export const findAllNotesController = async ({
  filterQuery,
}: {
  filterQuery: FilterQueryInput;
}) => {
  const page = filterQuery.page || 1;
  const limit = filterQuery.limit || 10;
  const offset = (page - 1) * limit;

  const [rows] = await runQuery({
    sql: "SELECT * FROM notes LIMIT @lim OFFSET @off",
    params: { lim: limit, off: offset },
  });

  return {
    status: "success",
    results: rows.length,
    notes: rows.map((r) => r.toJSON()),
  };
};

export const deleteNoteController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  await notesTable.deleteRows([paramsInput.noteId]);
  return { status: "success" };
};