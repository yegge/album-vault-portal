import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current user has admin role
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
};
