#!/usr/bin/env node

/**
 * ========================================
 * IMPORT TEST GROUP FROM CSV
 * ========================================
 * Reads CSV file and creates a test Secret Santa group
 * Usage: node scripts/import-test-group.js
 * ========================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================
// MATCHING ALGORITHM (from utils/matching.js)
// ========================================

function generateMatches(participants, restrictions = []) {
  const participantIds = participants.map(p => p.id);
  const matches = new Map();
  const available = [...participantIds];

  // Shuffle available pool
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  // Build restriction set for fast lookup
  const restrictionSet = new Set();
  restrictions.forEach(r => {
    restrictionSet.add(`${r.participant1}-${r.participant2}`);
    restrictionSet.add(`${r.participant2}-${r.participant1}`);
  });

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    matches.clear();
    const availableCopy = [...available];
    let failed = false;

    for (const giverId of participantIds) {
      // Filter valid matches
      const validMatches = availableCopy.filter(receiverId => {
        if (receiverId === giverId) return false;
        if (restrictionSet.has(`${giverId}-${receiverId}`)) return false;
        return true;
      });

      if (validMatches.length === 0) {
        failed = true;
        break;
      }

      // Pick random valid match
      const randomIndex = Math.floor(Math.random() * validMatches.length);
      const receiverId = validMatches[randomIndex];

      matches.set(giverId, receiverId);
      availableCopy.splice(availableCopy.indexOf(receiverId), 1);
    }

    if (!failed) {
      // Validate final matching
      if (validateMatching(matches, participants, restrictions)) {
        return matches;
      }
    }

    attempts++;
  }

  throw new Error('Could not generate valid matching after 100 attempts. Restrictions may be too tight.');
}

function validateMatching(matches, participants, restrictions = []) {
  const participantIds = new Set(participants.map(p => p.id));
  const receivers = new Set();

  // Check all participants matched
  if (matches.size !== participants.length) return false;

  for (const [giverId, receiverId] of matches) {
    // Check IDs exist
    if (!participantIds.has(giverId) || !participantIds.has(receiverId)) return false;

    // Check no self-assignment
    if (giverId === receiverId) return false;

    // Check no duplicate receivers
    if (receivers.has(receiverId)) return false;
    receivers.add(receiverId);

    // Check restrictions
    for (const r of restrictions) {
      if (
        (r.participant1 === giverId && r.participant2 === receiverId) ||
        (r.participant2 === giverId && r.participant1 === receiverId)
      ) {
        return false;
      }
    }
  }

  return true;
}

// ========================================
// CSV PARSER
// ========================================

function parseCSV(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  // Skip header
  const dataLines = lines.slice(1);

  const participants = [];
  const restrictions = [];

  dataLines.forEach(line => {
    const [userNumber, nombre, email, exclusiones] = line.split(',');

    const participant = {
      id: parseInt(userNumber),
      name: nombre.trim(),
      email: email.trim(),
    };

    participants.push(participant);

    // Parse restrictions (exclusiones)
    if (exclusiones && exclusiones.trim()) {
      const excludedId = parseInt(exclusiones.trim());

      // Only add restriction once (avoid duplicates)
      if (participant.id < excludedId) {
        restrictions.push({
          participant1: participant.id,
          participant2: excludedId,
        });
      }
    }
  });

  return { participants, restrictions };
}

// ========================================
// TOKEN GENERATOR
// ========================================

function generateToken() {
  return crypto.randomUUID();
}

// ========================================
// CREATE GROUP
// ========================================

async function createTestGroup(participants, restrictions) {
  console.log('\n🎁 Creating Secret Santa test group...\n');

  // Group metadata
  const groupData = {
    name: 'Secret Cabre 2025',
    deadline: '2025-12-24',
    priceRange: {
      min: 20000,
      max: 25000, // Fixed: max must be > min for DB constraint
      currency: 'CLP'
    },
    adminEmail: 'maxihnen@gmail.com',
    participants,
    restrictions,
  };

  console.log(`📊 Participants: ${participants.length}`);
  console.log(`🚫 Restrictions: ${restrictions.length} pairs`);
  console.log('');

  // Generate matches
  console.log('🎲 Generating matches...');
  const matchesMap = generateMatches(participants, restrictions);
  const matches = Array.from(matchesMap.entries());
  console.log(`✅ Matches generated successfully!\n`);

  // Create group in Supabase
  console.log('💾 Creating group in Supabase...');

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([
      {
        name: groupData.name,
        deadline: groupData.deadline,
        event_date: groupData.deadline,
        price_min: groupData.priceRange.min,
        price_max: groupData.priceRange.max,
        currency: groupData.priceRange.currency,
        admin_token: generateToken(),
        admin_email: groupData.adminEmail,
      },
    ])
    .select()
    .single();

  if (groupError) {
    console.error('❌ Error creating group:', groupError);
    throw groupError;
  }

  console.log(`✅ Group created (ID: ${group.id})\n`);

  // Create participants
  console.log('👥 Creating participants...');

  const participantsData = participants.map(p => ({
    group_id: group.id,
    name: p.name,
    email: p.email,
    access_token: generateToken(),
  }));

  const { data: createdParticipants, error: participantsError } = await supabase
    .from('participants')
    .insert(participantsData)
    .select();

  if (participantsError) {
    console.error('❌ Error creating participants:', participantsError);
    throw participantsError;
  }

  console.log(`✅ ${createdParticipants.length} participants created\n`);

  // Create ID mapping (client IDs → database UUIDs)
  const idMapping = {};
  participants.forEach((clientParticipant, index) => {
    idMapping[clientParticipant.id] = createdParticipants[index].id;
  });

  // Create matches
  console.log('🔗 Creating matches...');

  const matchesData = matches.map(([giverId, receiverId]) => ({
    group_id: group.id,
    giver_id: idMapping[giverId],
    receiver_id: idMapping[receiverId],
  }));

  const { error: matchesError } = await supabase
    .from('matches')
    .insert(matchesData);

  if (matchesError) {
    console.error('❌ Error creating matches:', matchesError);
    throw matchesError;
  }

  console.log(`✅ ${matchesData.length} matches created\n`);

  // Create restrictions
  if (restrictions.length > 0) {
    console.log('🚫 Creating restrictions...');

    const restrictionsData = restrictions.map(r => ({
      group_id: group.id,
      participant1_id: idMapping[r.participant1],
      participant2_id: idMapping[r.participant2],
    }));

    const { error: restrictionsError } = await supabase
      .from('restrictions')
      .insert(restrictionsData);

    if (restrictionsError) {
      console.error('❌ Error creating restrictions:', restrictionsError);
      throw restrictionsError;
    }

    console.log(`✅ ${restrictionsData.length} restrictions created\n`);
  }

  return { group, participants: createdParticipants, matches };
}

// ========================================
// DISPLAY RESULTS
// ========================================

function displayResults(group, participants, matches) {
  console.log('════════════════════════════════════════');
  console.log('✅ TEST GROUP CREATED SUCCESSFULLY!');
  console.log('════════════════════════════════════════\n');

  console.log('📋 GROUP DETAILS:');
  console.log(`   Name: ${group.name}`);
  console.log(`   ID: ${group.id}`);
  console.log(`   Deadline: ${group.deadline}`);
  console.log(`   Price: ${group.price_min.toLocaleString()} ${group.currency}`);
  console.log('');

  console.log('🔑 ADMIN ACCESS:');
  console.log(`   http://localhost:5173/group/${group.id}/${group.admin_token}`);
  console.log('');

  console.log('👥 PARTICIPANT ACCESS LINKS:');
  console.log('');

  participants.forEach(p => {
    const url = `http://localhost:5173/participant/${p.access_token}`;
    console.log(`   ${p.name.padEnd(20)} → ${url}`);
  });

  console.log('');
  console.log('════════════════════════════════════════');
  console.log('');
  console.log('💡 NEXT STEPS:');
  console.log('   1. Start dev server: cd frontend && npm run dev');
  console.log('   2. Visit admin dashboard using the link above');
  console.log('   3. Test participant views by clicking any participant link');
  console.log('   4. Verify matches are working correctly');
  console.log('');

  // Save to file for easy access
  const outputPath = path.join(__dirname, '../test-group-results.txt');
  const output = `
QUIENTETO.CA TEST GROUP
==================

Group: ${group.name}
ID: ${group.id}
Deadline: ${group.deadline}
Price: ${group.price_min.toLocaleString()} ${group.currency}

ADMIN DASHBOARD:
http://localhost:5173/group/${group.id}/${group.admin_token}

PARTICIPANT LINKS:
${participants.map(p => `${p.name}: http://localhost:5173/participant/${p.access_token}`).join('\n')}

Created: ${new Date().toISOString()}
`;

  fs.writeFileSync(outputPath, output);
  console.log(`📄 Results saved to: test-group-results.txt\n`);
}

// ========================================
// MAIN
// ========================================

async function main() {
  try {
    const csvPath = path.join(__dirname, '../../secret cabre (Responses) .csv');

    console.log('\n🎄 QUIENTETO.CA TEST GROUP IMPORT\n');
    console.log(`📂 Reading CSV: ${csvPath}\n`);

    // Parse CSV
    const { participants, restrictions } = parseCSV(csvPath);

    // Create group
    const result = await createTestGroup(participants, restrictions);

    // Display results
    displayResults(result.group, result.participants, result.matches);

    console.log('✅ Import complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
