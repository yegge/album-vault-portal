import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AlbumCard from "@/components/AlbumCard";
import AlbumDetail from "@/components/AlbumDetail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: string;
  artwork_front: string;
  artwork_back?: string | null;
  artwork_sleeve?: string | null;
  artwork_sticker?: string | null;
  artwork_fullcover?: string | null;
  artwork_fullinner?: string | null;
  album_name: string;
  album_artist: string;
  album_type: string;
  catalog_number: string;
  release_date?: string | null;
  album_duration?: string | null;
  status: string;
  producers?: any[] | null;
  engineers?: any[] | null;
  mastering?: any[] | null;
  commentary?: string | null;
  streaming_links?: Record<string, string> | null;
  purchase_links?: Record<string, string> | null;
}

interface Track {
  track_id: string;
  album_id: string;
  track_number: number;
  track_name: string;
  duration: string;
  artists?: any[] | null;
  track_status: string;
  allow_stream?: boolean;
  stream_embed?: string | null;
}

const Index = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAlbums(albums);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAlbums(
        albums.filter(
          (album) =>
            album.album_name.toLowerCase().includes(query) ||
            album.album_artist.toLowerCase().includes(query) ||
            album.catalog_number.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, albums]);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("visibility", "Public")
        .order("release_date", { ascending: false });

      if (error) throw error;
      setAlbums((data || []) as Album[]);
      setFilteredAlbums((data || []) as Album[]);
    } catch (error: any) {
      toast({
        title: "Error loading albums",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("album_id", albumId)
        .order("track_number");

      if (error) throw error;
      setTracks((data || []) as Track[]);
    } catch (error: any) {
      toast({
        title: "Error loading tracks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAlbumClick = async (album: Album) => {
    setSelectedAlbum(album);
    await fetchTracks(album.id);
  };

  if (selectedAlbum) {
    return (
      <AlbumDetail
        album={selectedAlbum}
        tracks={tracks}
        onClose={() => {
          setSelectedAlbum(null);
          setTracks([]);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Music className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-center mb-6 text-gradient">
            Music Catalog
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of albums, tracks, and releases
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 glass border-b border-border/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search albums, artists, or catalog numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 border-border/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No albums found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back later for new releases"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAlbums.length} {filteredAlbums.length === 1 ? "album" : "albums"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAlbums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleAlbumClick(album)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Music Catalog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
