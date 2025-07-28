import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Note, CreateNoteRequest, TagsResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  LogOut,
  Trash2,
  Edit3,
  User,
  StickyNote,
  Loader2,
  Pin,
  Archive,
  Tag,
  X,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<
    CreateNoteRequest & { tags: string[] }
  >({
    title: "",
    content: "",
    color: "#ffffff",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

  const colors = [
    "#ffffff",
    "#fef3c7",
    "#fecaca",
    "#fed7d7",
    "#c7d2fe",
    "#d1fae5",
    "#e0e7ff",
    "#f3e8ff",
  ];

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    fetchNotes();
    fetchTags();
  }, [user, token, navigate, activeTab, selectedTag]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedTag) params.append("tag", selectedTag);
      if (activeTab === "pinned") params.append("pinned", "true");
      if (activeTab === "archived") params.append("archived", "true");

      const response = await fetch(`/api/notes?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: TagsResponse = await response.json();
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const data = await response.json();
      setNotes((prev) => [data.note, ...prev]);
      setNewNote({ title: "", content: "", color: "#ffffff", tags: [] });
      setIsCreateDialogOpen(false);
      setError("");
      fetchTags(); // Refresh tags
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  const updateNote = async () => {
    if (!editingNote) return;

    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingNote.title,
          content: editingNote.content,
          color: editingNote.color,
          tags: editingNote.tags || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const data = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? data.note : note)),
      );
      setIsEditDialogOpen(false);
      setEditingNote(null);
      setError("");
      fetchTags(); // Refresh tags
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      fetchTags(); // Refresh tags
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const togglePin = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/pin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle pin");
      }

      const data = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? data.note : note)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle pin");
    }
  };

  const toggleArchive = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/archive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle archive");
      }

      const data = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? data.note : note)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle archive");
    }
  };

  const addTag = (noteForm: any, setNoteForm: any) => {
    if (newTag.trim() && !noteForm.tags.includes(newTag.trim().toLowerCase())) {
      setNoteForm({
        ...noteForm,
        tags: [...noteForm.tags, newTag.trim().toLowerCase()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string, noteForm: any, setNoteForm: any) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  const openEditDialog = (note: Note) => {
    setEditingNote({
      ...note,
      tags: note.tags || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes();
  };

  const filteredNotes = notes.filter((note) => {
    if (activeTab === "pinned") return note.isPinned;
    if (activeTab === "archived") return note.isArchived;
    return !note.isArchived;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NoteTaker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            You have {notes.length} {notes.length === 1 ? "note" : "notes"} in
            your collection.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <Button
                key={tag.name}
                variant={selectedTag === tag.name ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTag(selectedTag === tag.name ? "" : tag.name);
                  fetchNotes();
                }}
                className="text-xs"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name} ({tag.count})
              </Button>
            ))}
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Textarea
                  placeholder="Write your note content here..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />

                {/* Tags Input */}
                <div>
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newNote.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag, newNote, setNewNote)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addTag(newNote, setNewNote))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(newNote, setNewNote)}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Choose a color:</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setNewNote((prev) => ({ ...prev, color }))
                        }
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newNote.color === color
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={createNote}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <StickyNote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedTag ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTag
                ? "Try adjusting your search terms or filters"
                : "Create your first note to get started!"}
            </p>
            {!searchTerm && !selectedTag && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md relative"
                style={{ backgroundColor: note.color || "#ffffff" }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {note.isPinned && (
                        <Pin className="w-4 h-4 text-amber-500 mb-2" />
                      )}
                      <h3 className="font-semibold text-gray-900 truncate pr-2">
                        {note.title}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(note)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePin(note.id)}>
                          <Pin className="w-4 h-4 mr-2" />
                          {note.isPinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleArchive(note.id)}
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          {note.isArchived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 text-sm line-clamp-4 mb-3">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            {editingNote && (
              <div className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote((prev) =>
                      prev ? { ...prev, title: e.target.value } : null,
                    )
                  }
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Textarea
                  placeholder="Write your note content here..."
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote((prev) =>
                      prev ? { ...prev, content: e.target.value } : null,
                    )
                  }
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />

                {/* Tags Input */}
                <div>
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingNote.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            removeTag(tag, editingNote, setEditingNote)
                          }
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(),
                        addTag(editingNote, setEditingNote))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(editingNote, setEditingNote)}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Choose a color:</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setEditingNote((prev) =>
                            prev ? { ...prev, color } : null,
                          )
                        }
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          editingNote.color === color
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={updateNote}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Update Note
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
