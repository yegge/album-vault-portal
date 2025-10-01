import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Sign in to manage your music catalog</p>
        </div>
        <div className="glass p-8 rounded-lg">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(0 0% 20%)",
                    brandAccent: "hsl(0 0% 25%)",
                    inputBackground: "hsl(0 0% 8%)",
                    inputText: "hsl(0 0% 95%)",
                    inputBorder: "hsl(0 0% 18%)",
                    inputBorderFocus: "hsl(0 0% 25%)",
                    inputBorderHover: "hsl(0 0% 25%)",
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
