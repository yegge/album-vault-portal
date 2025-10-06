import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import DOMPurify from "dompurify";
import { format } from "date-fns";

interface StandaloneTrackNotesProps {
  trackId: string;
}

interface TrackNote {
  id: string;
  note_content: string;
  user_initials: string;
  created_at: string;
}

export const StandaloneTrackNotes = ({ trackId }: StandaloneTrackNotesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");
  const [userInitials, setUserInitials] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["standalone-track-notes", trackId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standalone_track_notes")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrackNote[];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!noteContent.trim() || !userInitials.trim()) {
        throw new Error("Note content and initials are required");
      }

      const { error } = await supabase
        .from("standalone_track_notes")
        .insert({
          track_id: trackId,
          note_content: noteContent,
          user_initials: userInitials,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standalone-track-notes", trackId] });
      setNoteContent("");
      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
      });
      logger.info("Track note added", { trackId });
    },
    onError: (error) => {
      logger.error("Failed to add track note", { trackId, error });
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderNoteContent = (content: string) => {
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["iframe"],
      ALLOWED_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
    });
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="Your initials"
            value={userInitials}
            onChange={(e) => setUserInitials(e.target.value)}
            maxLength={10}
          />
          <Textarea
            placeholder="Add a note (supports iframe embeds)..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
          />
          <Button
            onClick={() => addNoteMutation.mutate()}
            disabled={addNoteMutation.isPending || !noteContent.trim() || !userInitials.trim()}
          >
            Add Note
          </Button>
        </div>

        <div className="space-y-3 mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-2">
                <div className="prose prose-sm max-w-none">
                  {renderNoteContent(note.note_content)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {note.user_initials} • {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
