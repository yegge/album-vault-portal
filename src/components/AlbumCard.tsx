import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

const toRomanNumeral = (num: number): string => {
  if (num === 0) return "0";
  const romanNumerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let result = "";
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
};

const formatCatalogNumber = (catalogNumber: string): string => {
  const match = catalogNumber.match(/^([A-Za-z\-]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const number = parseInt(match[2], 10);
    return `${prefix}${toRomanNumeral(number)}`;
  }
  return catalogNumber;
};

interface Album {
  id: string;
  artwork_front: string;
  album_name: string;
  album_artist: string;
  album_type: string;
  release_date?: string | null;
  removal_date?: string | null;
  catalog_number: string;
  status: string;
}

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      <Card 
        className="group cursor-pointer card-hover overflow-hidden border-border/50 bg-card/50 backdrop-blur"
        onClick={onClick}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={album.artwork_front}
            alt={album.album_name}
            className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full bg-primary/90 backdrop-blur hover:bg-primary"
            >
              <Play className="h-6 w-6" />
              View Album
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full bg-background/90 backdrop-blur hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageOpen(true);
              }}
            >
              <Maximize2 className="h-6 w-6" />
            </Button>
          </div>
        <Badge 
          className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-primary-foreground"
        >
          {album.album_type}
        </Badge>
      </div>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-1 text-foreground">
            {album.album_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {album.album_artist}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-foreground font-mono">
              {formatCatalogNumber(album.catalog_number)}
            </span>
            {album.status === 'Removed' && album.release_date && album.removal_date ? (
              <div className="text-xs text-right">
                <div className="text-muted-foreground">RELEASED: {new Date(album.release_date).toLocaleDateString()}</div>
                <div className="font-bold text-destructive">NO LONGER AVAILABLE as of {new Date(album.removal_date).toLocaleDateString()}</div>
              </div>
            ) : album.release_date && (
              <span className="text-xs text-muted-foreground">
                {new Date(album.release_date).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        <img
          src={album.artwork_front}
          alt={album.album_name}
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AlbumCard;
