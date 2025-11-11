// All code in ENGLISH, UI labels in PORTUGUESE
// Helper functions for development and testing

import type { Player, Tournament, Position } from '../types';
import { createPlayer } from './rankings';
import { saveTournament, getActiveTournament } from '../db';

/**
 * Add a player to the active tournament (for console use)
 */
export async function addPlayerToTournament(name: string, position: Position): Promise<void> {
  try {
    const tournament = await getActiveTournament();

    if (!tournament) {
      console.error('No active tournament found. Create one first.');
      return;
    }

    const newPlayer = createPlayer(`p-${Date.now()}`, name, position);
    const updatedTournament = {
      ...tournament,
      players: [...tournament.players, newPlayer],
    };

    await saveTournament(updatedTournament);
    console.log(`Player ${name} (${position}) added successfully!`);
    console.log(`Total players: ${updatedTournament.players.length}/24`);
  } catch (error) {
    console.error('Error adding player:', error);
  }
}

/**
 * Quick setup for testing - adds 24 dummy players
 */
export async function quickSetupPlayers(): Promise<void> {
  try {
    const tournament = await getActiveTournament();

    if (!tournament) {
      console.error('No active tournament found. Create one first.');
      return;
    }

    const drivePlayers: Player[] = [];
    const backhandPlayers: Player[] = [];

    // Create 12 drive players
    for (let i = 1; i <= 12; i++) {
      drivePlayers.push(createPlayer(`drive-${i}`, `Drive ${i}`, 'drive'));
    }

    // Create 12 backhand players
    for (let i = 1; i <= 12; i++) {
      backhandPlayers.push(createPlayer(`backhand-${i}`, `Revés ${i}`, 'backhand'));
    }

    const updatedTournament = {
      ...tournament,
      players: [...drivePlayers, ...backhandPlayers],
    };

    await saveTournament(updatedTournament);
    console.log('24 players added successfully!');
    console.log('Drive players:', drivePlayers.map(p => p.name).join(', '));
    console.log('Backhand players:', backhandPlayers.map(p => p.name).join(', '));
  } catch (error) {
    console.error('Error in quick setup:', error);
  }
}

// Expose functions to window for console access
if (typeof window !== 'undefined') {
  (window as any).addPlayer = addPlayerToTournament;
  (window as any).quickSetupPlayers = quickSetupPlayers;
}
