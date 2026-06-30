/** Shared TxLINE record types (mirror txline/src/txline-client.ts). */

export interface FixtureRecord {
  FixtureId: number;
  StartTime: number; // ms epoch
  Participant1: string;
  Participant2: string;
  Participant1IsHome: boolean;
  Participant1Id: number;
  Participant2Id: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Ts: number;
}

export interface ScoreUpdate {
  FixtureId: number;
  Seq: number;
  Ts: number;
  Action: string;
  GameState: string;
  Score?: Record<string, any>;
  Stats?: Record<string, number>;
  [k: string]: any;
}

export interface ProofNodeJson {
  hash: number[] | string;
  isRightSibling: boolean;
}

export interface StatValidation {
  ts: number;
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: number[];
  summary: {
    fixtureId: number;
    updateStats: { updateCount: number; minTimestamp: number; maxTimestamp: number };
    eventStatsSubTreeRoot: number[];
  };
  statProof: ProofNodeJson[];
  subTreeProof: ProofNodeJson[];
  mainTreeProof: ProofNodeJson[];
  statToProve2?: { key: number; value: number; period: number };
  statProof2?: ProofNodeJson[];
}

/** Soccer full-game goal stat keys (period 0). statKey 1 = P1 goals, 2 = P2 goals. */
export const STAT_KEY_P1_GOALS = 1;
export const STAT_KEY_P2_GOALS = 2;
export const FULL_GAME_PERIOD = 0;
