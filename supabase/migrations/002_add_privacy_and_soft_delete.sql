-- Add privacy toggle
alter table predictions add column is_private boolean default false;

-- Add soft delete capability
alter table predictions add column deleted_at timestamptz; 

-- Update RLS policies (if applicable) to ensure users can only see their own private inputs
-- (Assuming standard Select policy is active, you might need to update it to:
-- (is_private = false OR auth.uid() = user_id) AND deleted_at IS NULL
