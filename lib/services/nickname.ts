const PREFIXES = [
  'Thunder', 'Red', 'Navy', 'Silver', 'Goal', 'Rocket',
  'Striker', 'Golazo', 'Winger', 'Phantom', 'Diamond',
  'Tactical', 'Ultras', 'Golden', 'Iron', 'Blaze',
];

const SUFFIXES = [
  'Striker', 'Captain', 'Falcon', 'Blaze', 'Maestro', 'Lion',
  'FC', 'United', 'Legend', 'Wizard', 'King', 'Beast',
  'Tiger', 'Dragon', 'Phoenix', 'Hawk', 'Wolf',
];

export function generateNicknameSuggestions(email?: string): string[] {
  const token = email?.split('@')[0] ?? 'fan';
  const base = token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'Player';
  const cap = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  const prefixIdx = base.length % PREFIXES.length;
  const suffixIdx = (base.charCodeAt(0) ?? 80) % SUFFIXES.length;

  return [
    `${cap}FC`,
    `${PREFIXES[prefixIdx]}${cap}`,
    `${cap}${SUFFIXES[suffixIdx]}`,
  ];
}

export const FOOTBALL_ALIASES = [
  'The Maestro', 'El Capitán', 'The Wall', 'Golden Boot', 'Iron Glove',
  'The Phantom', 'Rocket Man', 'King Cobra', 'The Shark', 'Thunder Foot',
  'The Architect', 'Night Hawk', 'The Professor', 'Lightning Rod', 'Ice Cold',
];

export function randomAlias(): string {
  return FOOTBALL_ALIASES[Math.floor(Math.random() * FOOTBALL_ALIASES.length)];
}
