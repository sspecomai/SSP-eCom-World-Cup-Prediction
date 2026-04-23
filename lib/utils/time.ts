const bangkokFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok',
  dateStyle: 'medium',
  timeStyle: 'short'
});

export const formatBangkokTime = (value: string | Date) => bangkokFormatter.format(new Date(value));

export const isClosed = (closeAt: string) => new Date(closeAt).getTime() <= Date.now();

export const countdownParts = (closeAt: string) => {
  const diff = Math.max(new Date(closeAt).getTime() - Date.now(), 0);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
};
