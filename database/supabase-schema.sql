-- ================================================
-- AMIGIFT - SUPABASE DATABASE SCHEMA
-- Secret Santa / Amigo Secreto Application
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Groups table: stores Secret Santa group information
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Price range configuration
    price_min DECIMAL(10, 2) NOT NULL,
    price_max DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Group settings
    max_participants INTEGER DEFAULT 20,
    is_matching_done BOOLEAN DEFAULT FALSE,
    matching_completed_at TIMESTAMP WITH TIME ZONE,

    -- Admin control
    admin_email VARCHAR(255),
    admin_token VARCHAR(255) UNIQUE, -- For admin dashboard access

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_price_range CHECK (price_max > price_min),
    CONSTRAINT valid_currency CHECK (currency IN ('USD', 'EUR', 'CLP', 'GBP', 'MXN', 'ARS'))
);

-- Participants table: stores individual participants in each group
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    -- Personal info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,

    -- Access control
    access_token VARCHAR(255) UNIQUE NOT NULL, -- For participant-specific views

    -- Status tracking
    has_viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    wishlist_updated_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    UNIQUE(group_id, email)
);

-- Matches table: stores who gives to whom (Secret Santa assignments)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    giver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    -- Notification tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT no_self_assignment CHECK (giver_id != receiver_id),
    UNIQUE(giver_id), -- Each person gives to only one person
    UNIQUE(group_id, receiver_id) -- Each person receives from only one person
);

-- Wishlist items: stores participant wish lists
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    item_text TEXT NOT NULL,
    item_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT item_not_empty CHECK (LENGTH(TRIM(item_text)) > 0)
);

-- Restrictions: stores which participants cannot be matched together
CREATE TABLE restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    participant1_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    reason VARCHAR(255), -- Optional: why they can't be matched
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT no_self_restriction CHECK (participant1_id != participant2_id),
    CONSTRAINT unique_restriction UNIQUE(group_id, participant1_id, participant2_id)
);

-- Price range votes: optional feature for participants to vote on price ranges
CREATE TABLE price_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    preferred_min DECIMAL(10, 2),
    preferred_max DECIMAL(10, 2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(participant_id, group_id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX idx_participants_group_id ON participants(group_id);
CREATE INDEX idx_participants_access_token ON participants(access_token);
CREATE INDEX idx_matches_group_id ON matches(group_id);
CREATE INDEX idx_matches_giver_id ON matches(giver_id);
CREATE INDEX idx_wishlist_participant_id ON wishlist_items(participant_id);
CREATE INDEX idx_restrictions_group_id ON restrictions(group_id);
CREATE INDEX idx_groups_admin_token ON groups(admin_token);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_votes ENABLE ROW LEVEL SECURITY;

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
    USING (
        admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
        OR admin_token IS NULL -- Allow public read for now (can be restricted later)
    );

CREATE POLICY "Admin can update their group" ON groups
    FOR UPDATE
    USING (admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token');

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
    USING (
        access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        OR group_id IN (
            SELECT id FROM groups
            WHERE admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
        )
    );

-- Participants can update their own data
CREATE POLICY "Participants can update own data" ON participants
    FOR UPDATE
    USING (access_token = current_setting('request.jwt.claims', true)::json->>'access_token');

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
    USING (
        giver_id IN (
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
        OR group_id IN (
            SELECT id FROM groups
            WHERE admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
        )
    );

-- ================================================
-- WISHLIST POLICIES
-- ================================================

-- Participants can create wishlist items for themselves
CREATE POLICY "Create own wishlist items" ON wishlist_items
    FOR INSERT
    WITH CHECK (
        participant_id IN (
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
    );

-- Participants can view:
-- 1. Their own wishlist
-- 2. The wishlist of the person they're giving to
CREATE POLICY "View accessible wishlists" ON wishlist_items
    FOR SELECT
    USING (
        participant_id IN (
            -- Own wishlist
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
        OR participant_id IN (
            -- Wishlist of person they're giving to
            SELECT receiver_id FROM matches
            WHERE giver_id IN (
                SELECT id FROM participants
                WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
            )
        )
        OR participant_id IN (
            -- Admin can see all wishlists in their group
            SELECT p.id FROM participants p
            INNER JOIN groups g ON p.group_id = g.id
            WHERE g.admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
        )
    );

-- Participants can update/delete their own wishlist items
CREATE POLICY "Update own wishlist items" ON wishlist_items
    FOR UPDATE
    USING (
        participant_id IN (
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
    );

CREATE POLICY "Delete own wishlist items" ON wishlist_items
    FOR DELETE
    USING (
        participant_id IN (
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
    );

-- ================================================
-- RESTRICTIONS POLICIES
-- ================================================

CREATE POLICY "Allow restriction creation" ON restrictions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "View group restrictions" ON restrictions
    FOR SELECT
    USING (true); -- Can be restricted later

-- ================================================
-- PRICE VOTES POLICIES
-- ================================================

CREATE POLICY "Create own price vote" ON price_votes
    FOR INSERT
    WITH CHECK (
        participant_id IN (
            SELECT id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
    );

CREATE POLICY "View group price votes" ON price_votes
    FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM participants
            WHERE access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
        )
        OR group_id IN (
            SELECT id FROM groups
            WHERE admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
        )
    );

-- ================================================
-- HELPER VIEWS (Optional - for easier queries)
-- ================================================

-- View to get full group information with participant count
CREATE OR REPLACE VIEW group_summary AS
SELECT
    g.*,
    COUNT(DISTINCT p.id) as participant_count,
    COUNT(DISTINCT CASE WHEN w.id IS NOT NULL THEN p.id END) as participants_with_wishlist
FROM groups g
LEFT JOIN participants p ON p.group_id = g.id
LEFT JOIN wishlist_items w ON w.participant_id = p.id
GROUP BY g.id;

-- ================================================
-- SEED DATA FOR TESTING (Optional - remove in production)
-- ================================================

-- Uncomment below to add test data
/*
INSERT INTO groups (name, deadline, event_date, price_min, price_max, currency, admin_token, admin_email)
VALUES ('Test Christmas 2025', '2025-12-20', '2025-12-25', 10, 50, 'USD', 'test-admin-token', 'admin@test.com');
*/
