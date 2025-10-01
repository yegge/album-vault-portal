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

export const AlbumForm = ({ albumId, onSuccess }: { albumId?: string; onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
          reset({
            album_name: data.album_name,
            album_artist: data.album_artist,
            catalog_number: data.catalog_number,
            album_type: data.album_type as Database["public"]["Enums"]["album_type"],
            status: data.status as Database["public"]["Enums"]["album_status"],
            visibility: data.visibility as Database["public"]["Enums"]["visibility_level"],
            artwork_front: data.artwork_front,
            release_date: data.release_date ?? undefined,
            commentary: data.commentary ?? undefined,
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

  const onSubmit = async (data: AlbumFormData) => {
    setLoading(true);
    try {
      // Ensure all required fields are present and properly typed
      const albumData = {
        album_name: data.album_name,
        album_artist: data.album_artist,
        catalog_number: data.catalog_number,
        album_type: data.album_type,
        status: data.status,
        visibility: data.visibility,
        artwork_front: data.artwork_front,
        release_date: data.release_date || null,
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

            <div className="space-y-2">
              <Label htmlFor="artwork_front">Front Artwork URL *</Label>
              <Input id="artwork_front" {...register("artwork_front")} placeholder="https://..." />
              {errors.artwork_front && (
                <p className="text-sm text-destructive">{errors.artwork_front.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input id="release_date" type="date" {...register("release_date")} />
            </div>
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
