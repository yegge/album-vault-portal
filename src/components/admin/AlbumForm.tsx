import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { albumFormSchema, type AlbumFormData } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { Upload } from "lucide-react";

export const AlbumForm = ({ albumId, onSuccess }: { albumId?: string; onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AlbumFormData>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      status: "In Development",
      visibility: "Public",
      album_type: "LP",
    },
  });

  useEffect(() => {
    const loadAlbum = async () => {
      if (albumId) {
        const { data, error } = await supabase
          .from("albums")
          .select("*")
          .eq("id", albumId)
          .maybeSingle();
        if (error) {
          logger.error("Failed to load album for editing", { albumId, error });
          toast({
            title: "Error",
            description: "Failed to load album for editing.",
            variant: "destructive",
          });
          return;
        }
        if (data) {
          const streamingLinks = data.streaming_links as any || {};
          const purchaseLinks = data.purchase_links as any || {};
          
          reset({
            album_name: data.album_name,
            album_artist: data.album_artist,
            catalog_number: data.catalog_number,
            album_type: data.album_type as Database["public"]["Enums"]["album_type"],
            status: data.status as Database["public"]["Enums"]["album_status"],
            visibility: data.visibility as Database["public"]["Enums"]["visibility_level"],
            artwork_front: data.artwork_front,
            artwork_back: data.artwork_back ?? undefined,
            artwork_sleeve: data.artwork_sleeve ?? undefined,
            artwork_sticker: data.artwork_sticker ?? undefined,
            artwork_fullcover: data.artwork_fullcover ?? undefined,
            artwork_fullinner: data.artwork_fullinner ?? undefined,
            upc: data.upc ?? undefined,
            release_date: data.release_date ?? undefined,
            removal_date: data.removal_date ?? undefined,
            commentary: data.commentary ?? undefined,
            apple_music: streamingLinks.apple_music ?? undefined,
            youtube_music: streamingLinks.youtube_music ?? undefined,
            tidal: streamingLinks.tidal ?? undefined,
            spotify: streamingLinks.spotify ?? undefined,
            itunes: purchaseLinks.itunes ?? undefined,
            artcore: purchaseLinks.artcore ?? undefined,
            bandcamp: purchaseLinks.bandcamp ?? undefined,
            cd_vinyl: purchaseLinks.cd_vinyl ?? undefined,
          });
        }
      } else {
        // Defaults for new album
        reset({
          status: "In Development" as Database["public"]["Enums"]["album_status"],
          visibility: "Public" as Database["public"]["Enums"]["visibility_level"],
        });
      }
    };
    loadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const handleFileUpload = async (file: File, fieldName: string) => {
    if (!file) return;
    
    setUploading(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('artwork')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artwork')
        .getPublicUrl(filePath);

      setValue(fieldName as any, publicUrl, { shouldValidate: true });
      
      toast({
        title: "Upload successful",
        description: "Artwork has been uploaded.",
      });
    } catch (error) {
      logger.error("Failed to upload artwork", { fieldName, error });
      toast({
        title: "Upload failed",
        description: "Failed to upload artwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (data: AlbumFormData) => {
    setLoading(true);
    try {
      const streamingLinks = {
        apple_music: data.apple_music || null,
        youtube_music: data.youtube_music || null,
        tidal: data.tidal || null,
        spotify: data.spotify || null,
      };

      const purchaseLinks = {
        itunes: data.itunes || null,
        artcore: data.artcore || null,
        bandcamp: data.bandcamp || null,
        cd_vinyl: data.cd_vinyl || null,
      };

      // Ensure all required fields are present and properly typed
      const albumData = {
        album_name: data.album_name,
        album_artist: data.album_artist,
        catalog_number: data.catalog_number,
        album_type: data.album_type,
        status: data.status,
        visibility: data.visibility,
        artwork_front: data.artwork_front,
        artwork_back: data.artwork_back || null,
        artwork_sleeve: data.artwork_sleeve || null,
        artwork_sticker: data.artwork_sticker || null,
        artwork_fullcover: data.artwork_fullcover || null,
        artwork_fullinner: data.artwork_fullinner || null,
        streaming_links: streamingLinks,
        purchase_links: purchaseLinks,
        upc: data.upc || null,
        release_date: data.release_date || null,
        removal_date: data.removal_date || null,
        commentary: data.commentary || null,
      };

      if (albumId) {
        const { error } = await supabase
          .from("albums")
          .update(albumData)
          .eq("id", albumId);

        if (error) throw error;

        toast({
          title: "Album updated",
          description: "The album has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("albums")
          .insert([albumData]);

        if (error) throw error;

        toast({
          title: "Album created",
          description: "The album has been successfully created.",
        });
        reset();
      }

      onSuccess?.();
      
      // Audit log for admin action
      logger.info(albumId ? "Album updated" : "Album created", { 
        action: albumId ? "update" : "create",
        albumId: albumId || "new",
        albumName: data.album_name 
      });
    } catch (error) {
      logger.error("Failed to save album", { 
        albumId, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
      toast({
        title: "Error",
        description: "Failed to save album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{albumId ? "Edit Album" : "Create New Album"}</CardTitle>
        <CardDescription>Fill in the album details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album_name">Album Name *</Label>
              <Input id="album_name" {...register("album_name")} />
              {errors.album_name && (
                <p className="text-sm text-destructive">{errors.album_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="album_artist">Artist *</Label>
              <Input id="album_artist" {...register("album_artist")} />
              {errors.album_artist && (
                <p className="text-sm text-destructive">{errors.album_artist.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catalog_number">Catalog Number *</Label>
              <Input id="catalog_number" {...register("catalog_number")} placeholder="ANG-01" />
              {errors.catalog_number && (
                <p className="text-sm text-destructive">{errors.catalog_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="album_type">Album Type *</Label>
              <Select value={watch("album_type") || "LP"} onValueChange={(value) => setValue("album_type", value as Database["public"]["Enums"]["album_type"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EP">EP</SelectItem>
                  <SelectItem value="LP">LP</SelectItem>
                  <SelectItem value="SP">SP</SelectItem>
                  <SelectItem value="Compilation">Compilation</SelectItem>
                </SelectContent>
              </Select>
              {errors.album_type && (
                <p className="text-sm text-destructive">{errors.album_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={watch("status") || "In Development"} onValueChange={(value) => setValue("status", value as Database["public"]["Enums"]["album_status"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Development">In Development</SelectItem>
                  <SelectItem value="Released">Released</SelectItem>
                  <SelectItem value="Removed">Removed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility *</Label>
              <Select value={watch("visibility") || "Public"} onValueChange={(value) => setValue("visibility", value as Database["public"]["Enums"]["visibility_level"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.visibility && (
                <p className="text-sm text-destructive">{errors.visibility.message}</p>
              )}
            </div>

            <div className="space-y-4 md:col-span-2 border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">Album Artwork</h3>
              
              <div className="space-y-2">
                <Label htmlFor="artwork_front">Front Cover *</Label>
                <div className="flex gap-2">
                  <Input id="artwork_front" {...register("artwork_front")} placeholder="URL or upload..." className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading === "artwork_front"}
                    onClick={() => document.getElementById("upload_artwork_front")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    id="upload_artwork_front"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_front")}
                  />
                </div>
                {errors.artwork_front && (
                  <p className="text-sm text-destructive">{errors.artwork_front.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artwork_back">Back Cover</Label>
                  <div className="flex gap-2">
                    <Input id="artwork_back" {...register("artwork_back")} placeholder="URL or upload..." className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading === "artwork_back"}
                      onClick={() => document.getElementById("upload_artwork_back")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="upload_artwork_back"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_back")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artwork_sleeve">Sleeve</Label>
                  <div className="flex gap-2">
                    <Input id="artwork_sleeve" {...register("artwork_sleeve")} placeholder="URL or upload..." className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading === "artwork_sleeve"}
                      onClick={() => document.getElementById("upload_artwork_sleeve")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="upload_artwork_sleeve"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_sleeve")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artwork_sticker">Sticker</Label>
                  <div className="flex gap-2">
                    <Input id="artwork_sticker" {...register("artwork_sticker")} placeholder="URL or upload..." className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading === "artwork_sticker"}
                      onClick={() => document.getElementById("upload_artwork_sticker")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="upload_artwork_sticker"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_sticker")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artwork_fullcover">Full Cover</Label>
                  <div className="flex gap-2">
                    <Input id="artwork_fullcover" {...register("artwork_fullcover")} placeholder="URL or upload..." className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading === "artwork_fullcover"}
                      onClick={() => document.getElementById("upload_artwork_fullcover")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="upload_artwork_fullcover"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_fullcover")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artwork_fullinner">Full Inner</Label>
                  <div className="flex gap-2">
                    <Input id="artwork_fullinner" {...register("artwork_fullinner")} placeholder="URL or upload..." className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading === "artwork_fullinner"}
                      onClick={() => document.getElementById("upload_artwork_fullinner")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="upload_artwork_fullinner"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "artwork_fullinner")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">Streaming Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apple_music">Apple Music</Label>
                  <Input id="apple_music" {...register("apple_music")} placeholder="https://music.apple.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify">Spotify</Label>
                  <Input id="spotify" {...register("spotify")} placeholder="https://open.spotify.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_music">YouTube Music</Label>
                  <Input id="youtube_music" {...register("youtube_music")} placeholder="https://music.youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tidal">Tidal</Label>
                  <Input id="tidal" {...register("tidal")} placeholder="https://tidal.com/..." />
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">Purchase Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itunes">iTunes (Digital)</Label>
                  <Input id="itunes" {...register("itunes")} placeholder="https://itunes.apple.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bandcamp">Bandcamp (Digital)</Label>
                  <Input id="bandcamp" {...register("bandcamp")} placeholder="https://bandcamp.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artcore">Artcore (Digital)</Label>
                  <Input id="artcore" {...register("artcore")} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cd_vinyl">CD & Vinyl</Label>
                  <Input id="cd_vinyl" {...register("cd_vinyl")} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upc">UPC (Admin Only)</Label>
              <Input id="upc" {...register("upc")} placeholder="123456789012" />
              {errors.upc && (
                <p className="text-sm text-destructive">{errors.upc.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input id="release_date" type="date" {...register("release_date")} />
            </div>

            {watch("status") === "Removed" && (
              <div className="space-y-2">
                <Label htmlFor="removal_date">Removal Date</Label>
                <Input id="removal_date" type="date" {...register("removal_date")} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentary">Commentary</Label>
            <Textarea id="commentary" {...register("commentary")} rows={4} />
            {errors.commentary && (
              <p className="text-sm text-destructive">{errors.commentary.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : albumId ? "Update Album" : "Create Album"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
