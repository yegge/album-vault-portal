import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Play, ShoppingCart, Clock, Disc, Calendar } from "lucide-react";

interface Track {
  track_id: string;
  track_number: number;
  track_name: string;
  duration: string;
  artists?: any[];
  track_status: string;
  allow_stream?: boolean;
  stream_embed?: string | null;
}

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

interface AlbumDetailProps {
  album: Album;
  tracks: Track[];
  onClose: () => void;
}

const formatDuration = (duration: string) => {
  if (!duration) return "0:00";
  const match = duration.match(/(\d+):(\d+):(\d+)/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return duration;
};

const AlbumDetail = ({ album, tracks, onClose }: AlbumDetailProps) => {
  const artworks = [
    album.artwork_front,
    album.artwork_back,
    album.artwork_sleeve,
    album.artwork_sticker,
    album.artwork_fullcover,
    album.artwork_fullinner,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-8"
        >
          ← Back to Catalog
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Artwork Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden shadow-2xl">
              <img
                src={album.artwork_front}
                alt={album.album_name}
                className="w-full h-full object-cover"
              />
            </div>
            {artworks.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {artworks.slice(1).map((artwork, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary transition-colors"
                  >
                    <img
                      src={artwork}
                      alt={`${album.album_name} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-xs font-mono">
                  {album.catalog_number}
                </Badge>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  {album.album_type}
                </Badge>
                <Badge variant="secondary">{album.status}</Badge>
              </div>
              <h1 className="text-5xl font-bold mb-2 text-gradient">
                {album.album_name}
              </h1>
              <p className="text-2xl text-muted-foreground">{album.album_artist}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {album.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(album.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}
              {album.album_duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(album.album_duration)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Disc className="h-4 w-4" />
                {tracks.length} Tracks
              </div>
            </div>

            {/* Streaming Links */}
            {album.streaming_links && Object.keys(album.streaming_links).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Listen Now
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(album.streaming_links).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4" />
                        {platform}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Links */}
            {album.purchase_links && Object.keys(album.purchase_links).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Purchase
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(album.purchase_links).map(([format, url]) => (
                    <Button
                      key={format}
                      variant="gradient"
                      size="sm"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="h-4 w-4" />
                        {format}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Commentary */}
            {album.commentary && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {album.commentary}
                </p>
              </div>
            )}

            {/* Credits */}
            {(album.producers || album.engineers || album.mastering) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Credits
                </h3>
                <div className="space-y-2 text-sm">
                  {album.producers && (
                    <div>
                      <span className="text-muted-foreground">Producers:</span>{" "}
                      <span className="text-foreground">
                        {Array.isArray(album.producers) 
                          ? album.producers.map(p => typeof p === 'string' ? p : p.name).join(', ')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                  {album.engineers && (
                    <div>
                      <span className="text-muted-foreground">Engineers:</span>{" "}
                      <span className="text-foreground">
                        {Array.isArray(album.engineers)
                          ? album.engineers.map(e => typeof e === 'string' ? e : e.name).join(', ')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                  {album.mastering && (
                    <div>
                      <span className="text-muted-foreground">Mastering:</span>{" "}
                      <span className="text-foreground">
                        {Array.isArray(album.mastering)
                          ? album.mastering.map(m => typeof m === 'string' ? m : m.name).join(', ')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Track Listing */}
        <Separator className="my-12" />
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Track Listing</h2>
          <Card className="glass">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {tracks
                  .sort((a, b) => a.track_number - b.track_number)
                  .map((track, index) => (
                    <div
                      key={track.track_id}
                      className="p-4 hover:bg-secondary/50 transition-colors group space-y-4"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-muted-foreground font-mono text-sm w-8 text-right">
                          {track.track_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {track.track_name}
                          </h4>
                          {track.artists && track.artists.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {track.artists.map(a => typeof a === 'string' ? a : a.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {track.track_status}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-mono tabular-nums">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                      {track.stream_embed && (
                        <div 
                          className={track.allow_stream === false ? "opacity-30 pointer-events-none" : ""}
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(track.stream_embed, {
                              ALLOWED_TAGS: ['iframe', 'audio', 'source'],
                              ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'controls', 'type', 'style', 'class'],
                              ALLOW_DATA_ATTR: false
                            })
                          }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
