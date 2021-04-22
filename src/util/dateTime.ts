const padNum = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

export const formatDuration = (durationSeconds: number): string => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds - hours * 3600) / 60);
  const seconds = durationSeconds - hours * 3600 - minutes * 60;
  return padNum(hours) + ":" + padNum(minutes) + ":" + padNum(seconds);
};
