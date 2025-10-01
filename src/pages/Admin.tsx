import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlbumForm } from "@/components/admin/AlbumForm";
import { AlbumList } from "@/components/admin/AlbumList";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"albums" | "create">("albums");
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

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
        <div className="text-muted-foreground">Loading...</div>
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
        <Tabs value={tab} onValueChange={(v) => setTab(v as "albums" | "create")} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="create">{editingId ? "Edit Album" : "Create Album"}</TabsTrigger>
          </TabsList>

          <TabsContent value="albums">
            <AlbumList onEdit={(album) => { setEditingId(album.id); setTab("create"); }} />
          </TabsContent>

          <TabsContent value="create">
            <AlbumForm
              albumId={editingId}
              onSuccess={() => {
                setEditingId(undefined);
                setTab("albums");
                queryClient.invalidateQueries({ queryKey: ["admin-albums"] });
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
