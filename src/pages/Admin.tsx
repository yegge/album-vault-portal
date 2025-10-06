import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlbumForm } from "@/components/admin/AlbumForm";
import { AlbumList } from "@/components/admin/AlbumList";
import { TrackForm } from "@/components/admin/TrackForm";
import { TrackList } from "@/components/admin/TrackList";
import { LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/auth";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"albums" | "create" | "tracks">("albums");
  const [editingAlbumId, setEditingAlbumId] = useState<string | undefined>(undefined);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>(undefined);
  const [editingTrackId, setEditingTrackId] = useState<string | undefined>(undefined);
  const [showTrackForm, setShowTrackForm] = useState(false);

  const { data: albums } = useQuery({
    queryKey: ["admin-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("id, album_name")
        .order("album_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      setLoading(false);

      if (!adminStatus) {
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges to access this page.",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    checkAuthAndRole();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "albums" | "create" | "tracks")} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="create">{editingAlbumId ? "Edit Album" : "Create Album"}</TabsTrigger>
            <TabsTrigger value="tracks">Album Tracks</TabsTrigger>
          </TabsList>

          <TabsContent value="albums">
            <AlbumList onEdit={(album) => { setEditingAlbumId(album.id); setTab("create"); }} />
          </TabsContent>

          <TabsContent value="create">
            <AlbumForm
              albumId={editingAlbumId}
              onSuccess={() => {
                setEditingAlbumId(undefined);
                setTab("albums");
                queryClient.invalidateQueries({ queryKey: ["admin-albums"] });
              }}
            />
          </TabsContent>

          <TabsContent value="tracks" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Album</label>
                  <Select
                    value={selectedAlbumId}
                    onValueChange={(value) => {
                      setSelectedAlbumId(value);
                      setShowTrackForm(false);
                      setEditingTrackId(undefined);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an album to manage tracks" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums?.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.album_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAlbumId && !showTrackForm && (
                  <Button
                    onClick={() => {
                      setShowTrackForm(true);
                      setEditingTrackId(undefined);
                    }}
                    className="mt-6"
                  >
                    Add Track
                  </Button>
                )}
              </div>

              {selectedAlbumId && showTrackForm && (
                <TrackForm
                  albumId={selectedAlbumId}
                  trackId={editingTrackId}
                  onSuccess={() => {
                    setShowTrackForm(false);
                    setEditingTrackId(undefined);
                    queryClient.invalidateQueries({ queryKey: ["album-tracks", selectedAlbumId] });
                  }}
                  onCancel={() => {
                    setShowTrackForm(false);
                    setEditingTrackId(undefined);
                  }}
                />
              )}

              {selectedAlbumId && !showTrackForm && (
                <TrackList
                  albumId={selectedAlbumId}
                  onEdit={(track) => {
                    setEditingTrackId(track.track_id);
                    setShowTrackForm(true);
                  }}
                />
              )}
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
