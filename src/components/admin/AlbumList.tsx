import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AlbumList = () => {
  const { toast } = useToast();

  const { data: albums, isLoading, refetch } = useQuery({
    queryKey: ["admin-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album?")) return;

    try {
      const { error } = await supabase.from("albums").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Album deleted",
        description: "The album has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading albums...</div>;
  }

  if (!albums || albums.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No albums found. Create your first album!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {albums.map((album) => (
        <Card key={album.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {album.album_name}
                  <Badge variant="outline">{album.visibility}</Badge>
                </CardTitle>
                <CardDescription>
                  {album.album_artist} • {album.catalog_number} • {album.album_type}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(album.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <img
                src={album.artwork_front}
                alt={album.album_name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Status:</span> {album.status}</p>
                {album.release_date && (
                  <p><span className="text-muted-foreground">Release Date:</span> {album.release_date}</p>
                )}
                {album.commentary && (
                  <p className="text-muted-foreground line-clamp-2">{album.commentary}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
