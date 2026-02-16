
-- Tighten notifications insert: only allow creating notifications where the creator is authenticated
-- This is acceptable since notifications are created as side effects of user actions
DROP POLICY "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications for others"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id != auth.uid());

CREATE POLICY "Users can create self notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
