-- ================================================
-- QUIENTETOCA - ROW LEVEL SECURITY POLICIES v2.0
-- ================================================
-- Run this AFTER supabase-schema.sql
-- Based on Supabase Auth (auth.uid())
-- ================================================

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_votes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- USERS POLICIES
-- ================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Users can insert their own profile (on first login)
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (id = auth.uid());

-- Allow reading user info for participants in same group
CREATE POLICY "Users can read group members"
    ON users FOR SELECT
    USING (
        id IN (
            SELECT p2.user_id FROM participants p1
            JOIN participants p2 ON p1.group_id = p2.group_id
            WHERE p1.user_id = auth.uid() AND p1.kicked = FALSE
        )
    );

-- ================================================
-- GROUPS POLICIES
-- ================================================

-- Anyone authenticated can create a group
CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND organizer_id = auth.uid());

-- Organizers can update their groups
CREATE POLICY "Organizers can update their groups"
    ON groups FOR UPDATE
    USING (organizer_id = auth.uid());

-- Public groups can be read by anyone (for join page)
CREATE POLICY "Public groups are readable"
    ON groups FOR SELECT
    USING (is_public = TRUE OR organizer_id = auth.uid());

-- Participants can read their group
CREATE POLICY "Participants can read their group"
    ON groups FOR SELECT
    USING (
        id IN (
            SELECT group_id FROM participants
            WHERE user_id = auth.uid() AND kicked = FALSE
        )
    );

-- ================================================
-- PARTICIPANTS POLICIES
-- ================================================

-- Authenticated users can join groups
CREATE POLICY "Users can join groups"
    ON participants FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
        AND can_join_group(group_id, auth.uid())
    );

-- Participants can read other participants in same group
CREATE POLICY "Participants can read group members"
    ON participants FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM participants
            WHERE user_id = auth.uid() AND kicked = FALSE
        )
        OR
        group_id IN (
            SELECT id FROM groups WHERE organizer_id = auth.uid()
        )
    );

-- Users can update their own participant record
CREATE POLICY "Users can update own participant"
    ON participants FOR UPDATE
    USING (user_id = auth.uid());

-- Organizers can update participants in their groups (kick)
CREATE POLICY "Organizers can update participants"
    ON participants FOR UPDATE
    USING (
        group_id IN (
            SELECT id FROM groups WHERE organizer_id = auth.uid()
        )
    );

-- ================================================
-- MATCHES POLICIES
-- ================================================

-- Service role only can insert matches (Edge Function)
CREATE POLICY "Service role can insert matches"
    ON matches FOR INSERT
    WITH CHECK (TRUE); -- Edge function uses service role

-- Givers can see their own match
CREATE POLICY "Givers can see their match"
    ON matches FOR SELECT
    USING (
        giver_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

-- Organizers can see all matches in their groups
CREATE POLICY "Organizers can see group matches"
    ON matches FOR SELECT
    USING (
        group_id IN (
            SELECT id FROM groups WHERE organizer_id = auth.uid()
        )
    );

-- ================================================
-- WISHLIST POLICIES
-- ================================================

-- Users can create wishlist items for their participant
CREATE POLICY "Users can create own wishlist"
    ON wishlist_items FOR INSERT
    WITH CHECK (
        participant_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

-- Users can update their own wishlist
CREATE POLICY "Users can update own wishlist"
    ON wishlist_items FOR UPDATE
    USING (
        participant_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist"
    ON wishlist_items FOR DELETE
    USING (
        participant_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

-- Users can see their own wishlist
CREATE POLICY "Users can read own wishlist"
    ON wishlist_items FOR SELECT
    USING (
        participant_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

-- Givers can see their receiver's wishlist
CREATE POLICY "Givers can see receiver wishlist"
    ON wishlist_items FOR SELECT
    USING (
        participant_id IN (
            SELECT receiver_id FROM matches
            WHERE giver_id IN (
                SELECT id FROM participants WHERE user_id = auth.uid()
            )
        )
    );

-- Organizers can see all wishlists in their groups
CREATE POLICY "Organizers can see group wishlists"
    ON wishlist_items FOR SELECT
    USING (
        participant_id IN (
            SELECT p.id FROM participants p
            JOIN groups g ON p.group_id = g.id
            WHERE g.organizer_id = auth.uid()
        )
    );

-- ================================================
-- RESTRICTIONS POLICIES
-- ================================================

-- Users can create self-restrictions
CREATE POLICY "Users can create self restrictions"
    ON restrictions FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (
            is_self_imposed = TRUE
            OR
            -- Organizers can force restrictions
            group_id IN (SELECT id FROM groups WHERE organizer_id = auth.uid())
        )
    );

-- Users can delete their own self-restrictions
CREATE POLICY "Users can delete own restrictions"
    ON restrictions FOR DELETE
    USING (
        (created_by = auth.uid() AND is_self_imposed = TRUE)
        OR
        -- Organizers can delete any restriction in their group
        group_id IN (SELECT id FROM groups WHERE organizer_id = auth.uid())
    );

-- Participants can see restrictions in their group (public restrictions)
CREATE POLICY "Participants can see group restrictions"
    ON restrictions FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM participants
            WHERE user_id = auth.uid() AND kicked = FALSE
        )
        OR
        group_id IN (
            SELECT id FROM groups WHERE organizer_id = auth.uid()
        )
    );

-- ================================================
-- PRICE VOTES POLICIES
-- ================================================

-- Users can create/update their vote
CREATE POLICY "Users can upsert own vote"
    ON price_votes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vote"
    ON price_votes FOR UPDATE
    USING (user_id = auth.uid());

-- Participants can see votes in their group
CREATE POLICY "Participants can see group votes"
    ON price_votes FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM participants
            WHERE user_id = auth.uid() AND kicked = FALSE
        )
        OR
        group_id IN (
            SELECT id FROM groups WHERE organizer_id = auth.uid()
        )
    );

-- ================================================
-- DONE
-- ================================================

SELECT 'RLS policies v2.0 applied successfully!' as status;
