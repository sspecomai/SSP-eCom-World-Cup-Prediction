import { NextResponse } from 'next/server';

const leaderboard = [
  { username: 'ThunderMessi', pre_question_score: 30, match_score: 58, total_score: 88, ranking_position: 1 },
  { username: 'RedCaptain', pre_question_score: 25, match_score: 55, total_score: 80, ranking_position: 2 }
];

export async function GET() {
  return NextResponse.json({ data: leaderboard });
}
