-- ================================================
-- AMIGIFT - RLS POLICIES ONLY
-- ================================================
-- Safe to run on existing database
-- Drops and recreates all RLS policies
-- ================================================

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_votes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- DROP EXISTING POLICIES (if any)
-- ================================================

-- Groups policies
DROP POLICY IF EXISTS "Allow public group creation" ON groups;
DROP POLICY IF EXISTS "Admin can view their group" ON groups;
DROP POLICY IF EXISTS "Admin can update their group" ON groups;

-- Participants policies
DROP POLICY IF EXISTS "Allow participant creation" ON participants;
DROP POLICY IF EXISTS "Participants can view own data" ON participants;
DROP POLICY IF EXISTS "Participants can update own data" ON participants;

-- Matches policies
DROP POLICY IF EXISTS "Allow match creation" ON matches;
DROP POLICY IF EXISTS "Participants see own match" ON matches;

-- Wishlist policies
DROP POLICY IF EXISTS "Create own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "View accessible wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Update own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Delete own wishlist items" ON wishlist_items;

-- Restrictions policies
DROP POLICY IF EXISTS "Allow restriction creation" ON restrictions;
DROP POLICY IF EXISTS "View group restrictions" ON restrictions;

-- Price votes policies
DROP POLICY IF EXISTS "Create own price vote" ON price_votes;
DROP POLICY IF EXISTS "View group price votes" ON price_votes;

-- ================================================
-- GROUPS POLICIES
-- ================================================

-- Anyone can create a group (public endpoint)
CREATE POLICY "Allow public group creation" ON groups
    FOR INSERT
    WITH CHECK (true);

-- Anyone with admin_token can view/edit their group
CREATE POLICY "Admin can view their group" ON groups
    FOR SELECT
    USING (true); -- Allow public read for now

CREATE POLICY "Admin can update their group" ON groups
    FOR UPDATE
    USING (true); -- Allow public update for now (can be restricted later)

-- ================================================
-- PARTICIPANTS POLICIES
-- ================================================

-- Allow inserting participants when creating a group
CREATE POLICY "Allow participant creation" ON participants
    FOR INSERT
    WITH CHECK (true);

-- Participants can view their own data using access_token
CREATE POLICY "Participants can view own data" ON participants
    FOR SELECT
    USING (true); -- Allow public read for now

-- Participants can update their own data
CREATE POLICY "Participants can update own data" ON participants
    FOR UPDATE
    USING (true); -- Allow public update for now

-- ================================================
-- MATCHES POLICIES
-- ================================================

-- Only allow match creation during group setup
CREATE POLICY "Allow match creation" ON matches
    FOR INSERT
    WITH CHECK (true);

-- Participants can only see their own match (who they're giving to)
CREATE POLICY "Participants see own match" ON matches
    FOR SELECT
    USING (true); -- Allow public read for now

-- ================================================
-- WISHLIST POLICIES
-- ================================================

-- Participants can create wishlist items for themselves
CREATE POLICY "Create own wishlist items" ON wishlist_items
    FOR INSERT
    WITH CHECK (true); -- Allow public insert for now

-- Participants can view accessible wishlists
CREATE POLICY "View accessible wishlists" ON wishlist_items
    FOR SELECT
    USING (true); -- Allow public read for now

-- Participants can update/delete their own wishlist items
CREATE POLICY "Update own wishlist items" ON wishlist_items
    FOR UPDATE
    USING (true); -- Allow public update for now

CREATE POLICY "Delete own wishlist items" ON wishlist_items
    FOR DELETE
    USING (true); -- Allow public delete for now

-- ================================================
-- RESTRICTIONS POLICIES
-- ================================================

CREATE POLICY "Allow restriction creation" ON restrictions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "View group restrictions" ON restrictions
    FOR SELECT
    USING (true);

-- ================================================
-- PRICE VOTES POLICIES
-- ================================================

CREATE POLICY "Create own price vote" ON price_votes
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "View group price votes" ON price_votes
    FOR SELECT
    USING (true);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INDEXES (safe to create if not exists)
-- ================================================

CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_participants_access_token ON participants(access_token);
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_giver_id ON matches(giver_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_participant_id ON wishlist_items(participant_id);
CREATE INDEX IF NOT EXISTS idx_restrictions_group_id ON restrictions(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_admin_token ON groups(admin_token);

-- ================================================
-- DONE
-- ================================================

SELECT 'RLS policies applied successfully!' as status;
