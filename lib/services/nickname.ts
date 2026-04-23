const prefixes = ['Thunder', 'Red', 'Navy', 'Silver', 'Goal', 'Rocket'];
const suffixes = ['Striker', 'Captain', 'Falcon', 'Blaze', 'Maestro', 'Lion'];

export const generateNicknameSuggestions = (seed?: string) => {
  const token = seed?.split('@')[0] || 'fan';
  return prefixes.slice(0, 4).map((prefix, idx) => `${prefix}${token}${suffixes[idx]}`);
};
