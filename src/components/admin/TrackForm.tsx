import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { trackFormSchema, type TrackFormData, durationToInterval, intervalToDuration } from "@/lib/validation";
import { logger } from "@/lib/logger";

interface TrackFormProps {
  albumId: string;
  trackId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TrackForm = ({ albumId, trackId, onSuccess, onCancel }: TrackFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      track_status: "WIP",
      stage_of_production: "CONCEPTION",
      visibility: "Public",
      allow_stream: true,
      track_number: 1,
    },
  });

  useEffect(() => {
    const loadTrack = async () => {
      if (trackId) {
        const { data, error } = await supabase
          .from("tracks")
          .select("*")
          .eq("track_id", trackId)
          .maybeSingle();
          
        if (error) {
          logger.error("Failed to load track for editing", { trackId, error });
          toast({
            title: "Error",
            description: "Failed to load track for editing.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          reset({
            track_number: data.track_number,
            track_name: data.track_name,
            duration: intervalToDuration(data.duration as string),
            track_status: data.track_status as Database["public"]["Enums"]["track_status"],
            stage_of_production: data.stage_of_production as Database["public"]["Enums"]["production_stage"],
            visibility: data.visibility as Database["public"]["Enums"]["visibility_level"],
            allow_stream: data.allow_stream ?? true,
            stream_embed: data.stream_embed ?? undefined,
            isrc: data.isrc ?? undefined,
            commentary: data.commentary ?? undefined,
          });
        }
      }
    };
    loadTrack();
  }, [trackId, reset, toast]);

  const onSubmit = async (data: TrackFormData) => {
    setLoading(true);
    try {
      const trackData = {
        album_id: albumId,
        track_number: data.track_number,
        track_name: data.track_name,
        duration: durationToInterval(data.duration),
        track_status: data.track_status,
        stage_of_production: data.stage_of_production,
        visibility: data.visibility,
        allow_stream: data.allow_stream ?? true,
        stream_embed: data.stream_embed || null,
        isrc: data.isrc || null,
        commentary: data.commentary || null,
        stage_date: new Date().toISOString().split('T')[0],
      };

      if (trackId) {
        const { error } = await supabase
          .from("tracks")
          .update(trackData)
          .eq("track_id", trackId);

        if (error) throw error;

        toast({
          title: "Track updated",
          description: "The track has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("tracks")
          .insert([trackData]);

        if (error) throw error;

        toast({
          title: "Track created",
          description: "The track has been successfully created.",
        });
        reset();
      }

      logger.info(trackId ? "Track updated" : "Track created", {
        action: trackId ? "update" : "create",
        trackId: trackId || "new",
        albumId,
        trackName: data.track_name,
      });

      onSuccess?.();
    } catch (error) {
      logger.error("Failed to save track", {
        trackId,
        albumId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast({
        title: "Error",
        description: "Failed to save track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{trackId ? "Edit Track" : "Add New Track"}</CardTitle>
        <CardDescription>Fill in the track details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track_number">Track Number *</Label>
              <Input
                id="track_number"
                type="number"
                {...register("track_number", { valueAsNumber: true })}
              />
              {errors.track_number && (
                <p className="text-sm text-destructive">{errors.track_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (MM:SS) *</Label>
              <Input
                id="duration"
                placeholder="3:45"
                {...register("duration")}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="track_name">Track Name *</Label>
              <Input id="track_name" {...register("track_name")} />
              {errors.track_name && (
                <p className="text-sm text-destructive">{errors.track_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="track_status">Status *</Label>
              <Select
                value={watch("track_status") || "WIP"}
                onValueChange={(value) => setValue("track_status", value as Database["public"]["Enums"]["track_status"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIP">WIP</SelectItem>
                  <SelectItem value="RELEASED">Released</SelectItem>
                  <SelectItem value="SHELVED">Shelved</SelectItem>
                  <SelectItem value="B-SIDE">B-Side</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage_of_production">Production Stage *</Label>
              <Select
                value={watch("stage_of_production") || "CONCEPTION"}
                onValueChange={(value) => setValue("stage_of_production", value as Database["public"]["Enums"]["production_stage"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONCEPTION">Conception</SelectItem>
                  <SelectItem value="DEMO">Demo</SelectItem>
                  <SelectItem value="IN SESSION">In Session</SelectItem>
                  <SelectItem value="OUT SESSION">Out Session</SelectItem>
                  <SelectItem value="IN MIX">In Mix</SelectItem>
                  <SelectItem value="OUT MIX">Out Mix</SelectItem>
                  <SelectItem value="IN MASTERING">In Mastering</SelectItem>
                  <SelectItem value="OUT MASTERING">Out Mastering</SelectItem>
                  <SelectItem value="RELEASED">Released</SelectItem>
                  <SelectItem value="REMOVED">Removed</SelectItem>
                  <SelectItem value="SHELVED">Shelved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility *</Label>
              <Select
                value={watch("visibility") || "Public"}
                onValueChange={(value) => setValue("visibility", value as Database["public"]["Enums"]["visibility_level"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isrc">ISRC</Label>
              <Input id="isrc" {...register("isrc")} placeholder="US-XXX-00-00000" />
              {errors.isrc && (
                <p className="text-sm text-destructive">{errors.isrc.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="allow_stream"
                checked={watch("allow_stream")}
                onCheckedChange={(checked) => setValue("allow_stream", checked as boolean)}
              />
              <Label htmlFor="allow_stream" className="cursor-pointer">Allow Streaming</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream_embed">Stream Embed Code</Label>
            <Textarea 
              id="stream_embed" 
              {...register("stream_embed")} 
              rows={4}
              placeholder="<iframe src='...' />"
            />
            {errors.stream_embed && (
              <p className="text-sm text-destructive">{errors.stream_embed.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentary">Commentary</Label>
            <Textarea id="commentary" {...register("commentary")} rows={3} />
            {errors.commentary && (
              <p className="text-sm text-destructive">{errors.commentary.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : trackId ? "Update Track" : "Add Track"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
