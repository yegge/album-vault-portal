import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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
      logger.error('Error checking admin role', { error: error.message, userId: user.id });
      return false;
    }

    const isAdmin = !!data;
    logger.info('Admin access check', { userId: user.id, isAdmin });
    return isAdmin;
  } catch (error) {
    logger.error('Error in checkIsAdmin', { error });
    return false;
  }
};
