import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Note, INote } from "../models/Note";
import { isMongoConnected } from "../config/database";
import { inMemoryNotes, generateId, InMemoryNote } from "../storage/inMemory";
import {
  Note as NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  NotesResponse,
  NoteResponse as SingleNoteResponse,
} from "@shared/api";

// Helper functions
const createNoteResponse = (note: INote | InMemoryNote): NoteResponse => ({
  id: "id" in note ? note.id : note._id.toString(),
  title: note.title,
  content: note.content,
  color: note.color,
  tags: note.tags,
  userId: "id" in note ? note.userId : note.userId.toString(),
  isPinned: note.isPinned,
  isArchived: note.isArchived,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

// Storage abstraction helpers
const findUserNotes = async (
  userId: string,
  filters: any = {},
): Promise<(INote | InMemoryNote)[]> => {
  if (isMongoConnected) {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      isArchived: filters.archived === "true" ? true : { $ne: true },
    };

    if (filters.search) query.$text = { $search: filters.search };
    if (filters.tag) query.tags = { $in: [filters.tag] };
    if (filters.pinned === "true") query.isPinned = true;

    return await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(100);
  } else {
    return inMemoryNotes
      .filter((note) => {
        if (note.userId !== userId) return false;
        if (filters.archived === "true" && !note.isArchived) return false;
        if (filters.archived !== "true" && note.isArchived) return false;
        if (
          filters.search &&
          !note.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !note.content.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        if (filters.tag && !note.tags.includes(filters.tag)) return false;
        if (filters.pinned === "true" && !note.isPinned) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, 100);
  }
};

const createNote = async (noteData: any): Promise<INote | InMemoryNote> => {
  if (isMongoConnected) {
    const newNote = new Note(noteData);
    return await newNote.save();
  } else {
    const newNote: InMemoryNote = {
      id: generateId(),
      title: noteData.title,
      content: noteData.content,
      color: noteData.color || "#ffffff",
      tags: noteData.tags || [],
      userId: noteData.userId,
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryNotes.push(newNote);
    return newNote;
  }
};

const findNoteById = async (
  id: string,
  userId: string,
): Promise<INote | InMemoryNote | null> => {
  if (isMongoConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
  } else {
    return (
      inMemoryNotes.find((note) => note.id === id && note.userId === userId) ||
      null
    );
  }
};

const deleteNoteById = async (id: string, userId: string): Promise<boolean> => {
  if (isMongoConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Note.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    return !!result;
  } else {
    const index = inMemoryNotes.findIndex(
      (note) => note.id === id && note.userId === userId,
    );
    if (index === -1) return false;
    inMemoryNotes.splice(index, 1);
    return true;
  }
};

const getUserTags = async (
  userId: string,
): Promise<{ name: string; count: number }[]> => {
  if (isMongoConnected) {
    const tags = await Note.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    return tags.map((tag) => ({ name: tag._id, count: tag.count }));
  } else {
    const tagCounts: { [key: string]: number } = {};
    inMemoryNotes
      .filter((note) => note.userId === userId)
      .forEach((note) => {
        note.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }
};

// Get all notes for user
export const handleGetNotes: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { search, tag, pinned, archived } = req.query;

    const notes = await findUserNotes(userId, {
      search,
      tag,
      pinned,
      archived,
    });

    const response: NotesResponse = {
      notes: notes.map(createNoteResponse),
      total: notes.length,
    };

    res.json(response);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new note
export const handleCreateNote: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      title,
      content,
      color,
      tags = [],
    }: CreateNoteRequest & { tags?: string[] } = req.body;

    // Validation
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    if (title.length > 200) {
      return res
        .status(400)
        .json({ message: "Title must be 200 characters or less" });
    }

    if (content.length > 50000) {
      return res
        .status(400)
        .json({ message: "Content must be 50,000 characters or less" });
    }

    // Validate color format
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (color && !colorRegex.test(color)) {
      return res
        .status(400)
        .json({ message: "Invalid color format. Use hex format like #ffffff" });
    }

    // Create note
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      color: color || "#ffffff",
      tags: Array.isArray(tags)
        ? tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
        : [],
      userId: isMongoConnected ? new mongoose.Types.ObjectId(userId) : userId,
    };

    const newNote = await createNote(noteData);

    const response: SingleNoteResponse = {
      note: createNoteResponse(newNote),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single note
export const handleGetNote: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const note = await findNoteById(id, userId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const response: SingleNoteResponse = {
      note: createNoteResponse(note),
    };

    res.json(response);
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update note
export const handleUpdateNote: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const {
      title,
      content,
      color,
      tags,
      isPinned,
      isArchived,
    }: UpdateNoteRequest & {
      tags?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
    } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update fields if provided
    if (title !== undefined) {
      if (title.length > 200) {
        return res
          .status(400)
          .json({ message: "Title must be 200 characters or less" });
      }
      note.title = title.trim();
    }

    if (content !== undefined) {
      if (content.length > 50000) {
        return res
          .status(400)
          .json({ message: "Content must be 50,000 characters or less" });
      }
      note.content = content.trim();
    }

    if (color !== undefined) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      if (color && !colorRegex.test(color)) {
        return res
          .status(400)
          .json({
            message: "Invalid color format. Use hex format like #ffffff",
          });
      }
      note.color = color;
    }

    if (tags !== undefined) {
      note.tags = Array.isArray(tags)
        ? tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    if (isPinned !== undefined) {
      note.isPinned = isPinned;
    }

    if (isArchived !== undefined) {
      note.isArchived = isArchived;
    }

    await note.save();

    const response: SingleNoteResponse = {
      note: createNoteResponse(note),
    };

    res.json(response);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete note
export const handleDeleteNote: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const deleted = await deleteNoteById(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's tags
export const handleGetTags: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const tags = await getUserTags(userId);
    res.json({ tags });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Pin/Unpin note
export const handleTogglePin: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    const response: SingleNoteResponse = {
      note: createNoteResponse(note),
    };

    res.json(response);
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Archive/Unarchive note
export const handleToggleArchive: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isArchived = !note.isArchived;
    note.isPinned = false; // Unpin when archiving
    await note.save();

    const response: SingleNoteResponse = {
      note: createNoteResponse(note),
    };

    res.json(response);
  } catch (error) {
    console.error("Toggle archive error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
