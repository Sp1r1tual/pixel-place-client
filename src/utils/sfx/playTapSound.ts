const playTapSound = (tapSound: string) => {
  const audio = new Audio(tapSound);

  audio.volume = 1;
  audio.play().catch(() => {});
};

export { playTapSound };
