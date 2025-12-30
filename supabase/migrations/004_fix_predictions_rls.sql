-- Enable RLS on predictions if not already
alter table predictions enable row level security;

-- 1. Insert Policy: Authenticated users can create predictions
create policy "Users can create their own predictions"
on predictions for insert
to authenticated
with check (auth.uid() = user_id);

-- 2. Select Policy: 
-- Public predictions are visible to everyone
-- Private predictions are visible only to the creator
create policy "Public predictions are viewable by everyone"
on predictions for select
using (
  is_private = false 
  or 
  (auth.uid() = user_id)
);

-- 3. Update Policy: Users can update their own predictions
create policy "Users can update their own predictions"
on predictions for update
to authenticated
using (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own predictions (Soft delete is handled via Update usually, but if hard delete is allowed)
create policy "Users can delete their own predictions"
on predictions for delete
to authenticated
using (auth.uid() = user_id);
