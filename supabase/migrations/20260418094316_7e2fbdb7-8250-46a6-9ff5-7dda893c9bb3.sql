
DROP POLICY "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 200
    AND length(message) BETWEEN 1 AND 5000
    AND (subject IS NULL OR length(subject) <= 200)
    AND (phone IS NULL OR length(phone) <= 40)
  );
