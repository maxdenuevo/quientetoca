-- ================================================
-- QUIENTETOCA - SUPABASE DATABASE SCHEMA v2.0
-- Secret Santa / Amigo Secreto Application
-- ================================================
-- Requires: Supabase Auth enabled for OAuth providers
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE (linked to Supabase Auth)
-- ================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- GROUPS TABLE
-- ================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,

    -- Organizer (creator) - linked to users table
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Join code for public sharing (e.g., "ABC123")
    join_code VARCHAR(10) UNIQUE NOT NULL,

    -- Timing
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Price range (default, can be overridden by votes)
    price_min DECIMAL(10, 2) NOT NULL DEFAULT 5000,
    price_max DECIMAL(10, 2) NOT NULL DEFAULT 20000,
    currency VARCHAR(3) NOT NULL DEFAULT 'CLP',

    -- Settings
    max_participants INTEGER DEFAULT 20,
    is_public BOOLEAN DEFAULT TRUE,

    -- Raffle status
    raffled_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_price_range CHECK (price_max > price_min),
    CONSTRAINT valid_join_code CHECK (LENGTH(join_code) >= 6)
);

-- ================================================
-- PARTICIPANTS TABLE
-- ================================================

CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    -- User reference (authenticated participant)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Display name (can differ from user.name)
    name VARCHAR(255) NOT NULL,

    -- Status
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    kicked BOOLEAN DEFAULT FALSE,
    wishlist_updated_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints: one user per group
    UNIQUE(group_id, user_id)
);

-- ================================================
-- MATCHES TABLE (Secret Santa assignments)
-- ================================================

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    giver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    -- Email notification tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT no_self_assignment CHECK (giver_id != receiver_id),
    UNIQUE(giver_id),
    UNIQUE(group_id, receiver_id)
);

-- ================================================
-- WISHLIST ITEMS TABLE
-- ================================================

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    item_text TEXT NOT NULL,
    item_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT item_not_empty CHECK (LENGTH(TRIM(item_text)) > 0)
);

-- ================================================
-- RESTRICTIONS TABLE
-- ================================================

CREATE TABLE restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    -- The two participants who can't be matched
    participant1_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,

    -- Who created this restriction
    created_by UUID REFERENCES users(id),

    -- Type of restriction
    is_self_imposed BOOLEAN DEFAULT FALSE,
    forced_by_organizer BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT no_self_restriction CHECK (participant1_id != participant2_id)
);

-- ================================================
-- PRICE VOTES TABLE
-- ================================================

CREATE TABLE price_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One vote per user per group
    UNIQUE(group_id, user_id),
    CONSTRAINT valid_vote_range CHECK (max_price >= min_price)
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_groups_join_code ON groups(join_code);
CREATE INDEX idx_groups_organizer ON groups(organizer_id);
CREATE INDEX idx_participants_group ON participants(group_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_matches_group ON matches(group_id);
CREATE INDEX idx_matches_giver ON matches(giver_id);
CREATE INDEX idx_wishlist_participant ON wishlist_items(participant_id);
CREATE INDEX idx_restrictions_group ON restrictions(group_id);
CREATE INDEX idx_price_votes_group ON price_votes(group_id);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Generate unique join code (6 alphanumeric chars)
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code VARCHAR(10) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Check if user can join group
CREATE OR REPLACE FUNCTION can_join_group(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_participants INTEGER;
    v_current_count INTEGER;
    v_is_kicked BOOLEAN;
BEGIN
    -- Check if already kicked
    SELECT kicked INTO v_is_kicked
    FROM participants
    WHERE group_id = p_group_id AND user_id = p_user_id;

    IF v_is_kicked = TRUE THEN
        RETURN FALSE;
    END IF;

    -- Check participant limit
    SELECT max_participants INTO v_max_participants
    FROM groups WHERE id = p_group_id;

    SELECT COUNT(*) INTO v_current_count
    FROM participants
    WHERE group_id = p_group_id AND kicked = FALSE;

    RETURN v_current_count < v_max_participants;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_votes_updated_at
    BEFORE UPDATE ON price_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
