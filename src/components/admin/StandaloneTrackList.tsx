import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { intervalToDuration } from "@/lib/validation";

interface StandaloneTrackListProps {
  onEdit?: (track: any) => void;
}

export const StandaloneTrackList = ({ onEdit }: StandaloneTrackListProps) => {
  const { toast } = useToast();

  const { data: tracks, isLoading, refetch } = useQuery({
    queryKey: ["standalone-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standalone_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    try {
      const { error } = await supabase.from("standalone_tracks").delete().eq("track_id", trackId);

      if (error) throw error;

      toast({
        title: "Track deleted",
        description: "The standalone track has been successfully deleted.",
      });

      logger.info("Standalone track deleted", { action: "delete", trackId });

      refetch();
    } catch (error) {
      logger.error("Failed to delete standalone track", {
        trackId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast({
        title: "Error",
        description: "Failed to delete track. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading tracks...</div>;
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Music className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No standalone tracks yet. Add your first track!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <Card key={track.track_id}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {track.track_name}
                  <Badge variant="outline" className="ml-2">{track.visibility}</Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  {intervalToDuration(track.duration as string)} • {track.stage_of_production}
                  {track.isrc && ` • ISRC: ${track.isrc}`}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(track)}
                  aria-label="Edit track"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(track.track_id)}
                  aria-label="Delete track"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {track.commentary && (
            <CardContent className="py-2 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{track.commentary}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
