import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { trackFormSchema, type TrackFormData, durationToInterval } from "@/lib/validation";

interface StandaloneTrackFormProps {
  trackId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StandaloneTrackForm = ({ trackId, onSuccess, onCancel }: StandaloneTrackFormProps) => {
  const { toast } = useToast();
  const isEditing = !!trackId;

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      track_number: 1,
      track_name: "",
      album_artist: "",
      duration: "",
      track_status: "WIP",
      stage_of_production: "CONCEPTION",
      visibility: "Public",
      allow_stream: true,
    },
  });

  const { isLoading: isLoadingTrack } = useQuery({
    queryKey: ["standalone-track", trackId],
    queryFn: async () => {
      if (!trackId) return null;

      const { data, error } = await supabase
        .from("standalone_tracks")
        .select("*")
        .eq("track_id", trackId)
        .single();

      if (error) throw error;

      if (data) {
        const durationStr = String(data.duration || "");
        const durationMatch = durationStr.match(/(\d+):(\d+):(\d+)/);
        const formattedDuration = durationMatch 
          ? `${durationMatch[2]}:${durationMatch[3]}`
          : "00:00";

        form.reset({
          track_number: 1,
          track_name: data.track_name,
          album_artist: data.album_artist || "",
          duration: formattedDuration,
          track_status: data.track_status,
          stage_of_production: data.stage_of_production,
          visibility: data.visibility,
          isrc: data.isrc || undefined,
          stream_embed: data.stream_embed || undefined,
          allow_stream: data.allow_stream ?? true,
          commentary: data.commentary || undefined,
        });
      }

      return data;
    },
    enabled: isEditing,
  });

  const onSubmit = async (values: TrackFormData) => {
    try {
      const duration = durationToInterval(values.duration);

      const trackData = {
        track_name: values.track_name,
        album_artist: values.album_artist || null,
        duration,
        track_status: values.track_status,
        stage_of_production: values.stage_of_production,
        visibility: values.visibility,
        isrc: values.isrc || null,
        stream_embed: values.stream_embed || null,
        allow_stream: values.allow_stream,
        commentary: values.commentary || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("standalone_tracks")
          .update(trackData)
          .eq("track_id", trackId);

        if (error) throw error;

        toast({
          title: "Track updated",
          description: "The standalone track has been successfully updated.",
        });

        logger.info("Standalone track updated", { action: "update", trackId });
      } else {
        const { error } = await supabase
          .from("standalone_tracks")
          .insert(trackData);

        if (error) throw error;

        toast({
          title: "Track created",
          description: "The standalone track has been successfully created.",
        });

        logger.info("Standalone track created", { action: "create" });
      }

      onSuccess?.();
    } catch (error) {
      logger.error("Failed to save standalone track", {
        trackId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast({
        title: "Error",
        description: "Failed to save standalone track. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Standalone Track" : "Add Standalone Track"}</CardTitle>
        <CardDescription>
          Manage tracks that are not part of an album
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="track_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Track Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="album_artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album Artist</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (MM:SS)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="03:45" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="track_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WIP">WIP</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="RELEASED">Released</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage_of_production"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage of Production</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONCEPTION">Conception</SelectItem>
                        <SelectItem value="RECORDING">Recording</SelectItem>
                        <SelectItem value="MIXING">Mixing</SelectItem>
                        <SelectItem value="MASTERING">Mastering</SelectItem>
                        <SelectItem value="RELEASED">Released</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isrc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISRC (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="US-XXX-XX-XXXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allow_stream"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Streaming</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stream_embed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream Embed Code (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="<iframe>..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commentary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentary (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notes about this track..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting || isLoadingTrack}>
                {isEditing ? "Update Track" : "Add Track"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
