export type Probability = {
  label: string;
  value: number;
};

export type DemoPhase = {
  at: number;
  shotClock: number;
  state: string;
  read: string;
  actions: Probability[];
  coverages: Probability[];
  counter: string;
  epv: number;
  winProbability: number;
  confidence: number;
  offense: [number, number][];
  defense: [number, number][];
  ballOwner: number;
};

export type DemoGame = {
  id: string;
  league: 'NBA' | 'NCAA';
  away: string;
  awayCode: string;
  home: string;
  homeCode: string;
  offense: string;
  defense: string;
  awayCoach: string;
  homeCoach: string;
  situation: string;
  sample: string;
  signal: string;
  coachRead: string;
  playerRead: string;
  adjustmentRead: string;
  video: {
    id: string;
    title: string;
    sourceUrl: string;
    sourceLabel: string;
    starts: number[];
  };
  phases: DemoPhase[];
};

const formations = [
  {
    offense: [[54, 10], [55, 40], [63, 25], [78, 14], [78, 36]] as [number, number][],
    defense: [[58, 12], [58, 38], [68, 25], [81, 16], [82, 34]] as [number, number][],
  },
  {
    offense: [[59, 9], [58, 41], [66, 25], [77, 13], [82, 31]] as [number, number][],
    defense: [[62, 11], [62, 38], [69, 24], [81, 15], [84, 30]] as [number, number][],
  },
  {
    offense: [[62, 8], [61, 42], [72, 24], [79, 15], [84, 30]] as [number, number][],
    defense: [[65, 11], [65, 39], [74, 23], [82, 17], [86, 29]] as [number, number][],
  },
  {
    offense: [[67, 7], [66, 41], [77, 21], [82, 14], [86, 29]] as [number, number][],
    defense: [[69, 10], [70, 38], [79, 23], [84, 17], [88, 28]] as [number, number][],
  },
  {
    offense: [[69, 8], [75, 39], [82, 19], [85, 12], [89, 27]] as [number, number][],
    defense: [[72, 11], [77, 36], [83, 22], [87, 15], [90, 28]] as [number, number][],
  },
];

function phases(
  primary: string,
  secondary: string,
  coverage: string,
  counter: string,
  read: string,
  epv: number[],
  winProbability: number[],
): DemoPhase[] {
  const actionValues = [
    [[primary, 38], [secondary, 27], ['Motion entry', 20], ['Other', 15]],
    [[primary, 51], [secondary, 22], ['Isolation', 15], ['Other', 12]],
    [[primary, 68], [secondary, 15], ['Slip', 10], ['Other', 7]],
    [[counter, 55], [primary, 24], ['Reset', 13], ['Other', 8]],
    [[counter, 73], [primary, 12], ['Late clock', 9], ['Other', 6]],
  ];
  const coverageValues = [
    [[coverage, 42], ['Switch', 26], ['Drop', 20], ['Other', 12]],
    [[coverage, 55], ['Switch', 24], ['Drop', 13], ['Other', 8]],
    [[coverage, 71], ['Switch', 16], ['Drop', 8], ['Other', 5]],
    [['Help rotation', 52], [coverage, 30], ['Stay home', 11], ['Other', 7]],
    [['Help rotation', 67], [coverage, 19], ['Stay home', 9], ['Other', 5]],
  ];
  const states = ['Early alignment', 'Trigger developing', 'Action identified', 'Defense commits', 'Counter window'];

  return formations.map((formation, index) => ({
    at: index * 4,
    shotClock: 20 - index * 4,
    state: states[index],
    read: index < 2
      ? read
      : index === 2
        ? `${primary} geometry is now the dominant read.`
        : `${coverage} changes the available advantage.`,
    actions: actionValues[index].map(([label, value]) => ({ label: String(label), value: Number(value) })),
    coverages: coverageValues[index].map(([label, value]) => ({ label: String(label), value: Number(value) })),
    counter,
    epv: epv[index],
    winProbability: winProbability[index],
    confidence: [44, 58, 76, 70, 84][index],
    offense: formation.offense,
    defense: formation.defense,
    ballOwner: index < 3 ? 2 : index === 3 ? 4 : 3,
  }));
}

export const games: DemoGame[] = [
  {
    id: 'bos-gsw', league: 'NBA', away: 'Golden State', awayCode: 'GSW', home: 'Boston', homeCode: 'BOS',
    offense: 'Golden State', defense: 'Boston', awayCoach: 'Steve Kerr', homeCoach: 'Joe Mazzulla',
    situation: 'Q2 · 6:18 · BOS +4', sample: '5 annotated possessions', signal: 'Split-action entry',
    coachRead: 'Kerr favors movement that forces two defenders to exchange assignments away from the ball.',
    playerRead: 'The shooter changes direction underneath while the screener pauses near the elbow.',
    adjustmentRead: 'Boston switches the first exchange, making the back-cut branch more valuable.',
    video: {
      id: 'FS6FieaiaGk',
      title: 'Warriors at Celtics — full game highlights',
      sourceUrl: 'https://www.youtube.com/watch?v=FS6FieaiaGk',
      sourceLabel: 'Official NBA · March 18, 2026',
      starts: [12, 118, 236, 354, 472],
    },
    phases: phases('Split action', 'Chicago action', 'Switch', 'Backdoor cut', 'Two off-ball players converge at the elbow while the passer holds.', [1.06, 1.10, 1.17, 1.01, 1.24], [47.2, 47.7, 48.6, 48.1, 49.4]),
  },
  {
    id: 'nyk-cle', league: 'NBA', away: 'Cleveland', awayCode: 'CLE', home: 'New York', homeCode: 'NYK',
    offense: 'New York', defense: 'Cleveland', awayCoach: 'Kenny Atkinson', homeCoach: 'Mike Brown',
    situation: 'Q1 · 2:07 · NYK +1', sample: '5 annotated possessions', signal: 'Empty-corner screen',
    coachRead: 'New York clears a side to amplify the handler’s drive and pocket-pass reads.',
    playerRead: 'The handler rejects more often when the on-ball defender shades toward the screen.',
    adjustmentRead: 'Cleveland’s low man tags early, exposing the slot as the likely release valve.',
    video: {
      id: 'bAbxAomZWx8',
      title: 'Cavaliers at Knicks — full game highlights',
      sourceUrl: 'https://www.youtube.com/watch?v=bAbxAomZWx8',
      sourceLabel: 'Official NBA · October 22, 2025',
      starts: [18, 126, 244, 362, 480],
    },
    phases: phases('Empty-corner PNR', 'Isolation', 'Drop', 'Slot kick-out', 'The corner clears while the screener angles toward the empty side.', [1.00, 1.07, 1.14, 1.03, 1.20], [51.4, 52.0, 52.8, 52.3, 53.6]),
  },
  {
    id: 'lal-gsw', league: 'NBA', away: 'Golden State', awayCode: 'GSW', home: 'Los Angeles', homeCode: 'LAL',
    offense: 'Los Angeles', defense: 'Golden State', awayCoach: 'Steve Kerr', homeCoach: 'JJ Redick',
    situation: 'Q3 · 8:41 · LAL -3', sample: '5 annotated possessions', signal: 'Delay into pistol',
    coachRead: 'Redick uses a delay entry to hide the eventual side pick-and-roll and keep the paint open.',
    playerRead: 'The wing lifts as the handler turns the corner, stretching the low defender’s decision.',
    adjustmentRead: 'Golden State shows at the level, so the short roll becomes the central counter read.',
    video: {
      id: 'J_yiWj4wj-s',
      title: 'Warriors at Lakers — full game highlights',
      sourceUrl: 'https://www.youtube.com/watch?v=J_yiWj4wj-s',
      sourceLabel: 'Official NBA · February 7, 2026',
      starts: [14, 122, 240, 358, 476],
    },
    phases: phases('Pistol handoff', 'Angle PNR', 'At-level show', 'Short-roll pass', 'The wing receives on the move while the five trails into screening position.', [1.03, 1.09, 1.16, 1.07, 1.23], [45.8, 46.4, 47.3, 46.9, 48.1]),
  },
  {
    id: 'duke-ari', league: 'NCAA', away: 'Arizona', awayCode: 'ARI', home: 'Duke', homeCode: 'DUKE',
    offense: 'Duke', defense: 'Arizona', awayCoach: 'Tommy Lloyd', homeCoach: 'Jon Scheyer',
    situation: '2H · 11:32 · DUKE +5', sample: '5 annotated possessions', signal: 'Horns into mismatch',
    coachRead: 'Scheyer uses a horns shell to disguise which big becomes the active screener.',
    playerRead: 'The handler waits for the second big to lift before choosing a side.',
    adjustmentRead: 'Arizona switches the first screen; Duke flows into a seal against the guard.',
    video: {
      id: 'A9kqcnP6Hyo',
      title: 'Duke vs. Arizona — Sweet 16 extended highlights',
      sourceUrl: 'https://www.youtube.com/watch?v=A9kqcnP6Hyo',
      sourceLabel: 'Official March Madness · March 27, 2025',
      starts: [10, 124, 242, 360, 478],
    },
    phases: phases('Horns ball screen', 'Horns flare', 'Switch', 'Mismatch seal', 'Both bigs occupy the elbows while the corners stay flattened.', [1.04, 1.09, 1.16, 1.07, 1.25], [62.8, 63.5, 64.6, 64.0, 65.4]),
  },
  {
    id: 'aub-mich', league: 'NCAA', away: 'Michigan', awayCode: 'MICH', home: 'Auburn', homeCode: 'AUB',
    offense: 'Auburn', defense: 'Michigan', awayCoach: 'Dusty May', homeCoach: 'Bruce Pearl',
    situation: '1H · 7:46 · AUB -2', sample: '5 annotated possessions', signal: 'Wide pindown series',
    coachRead: 'Pearl layers screening actions quickly to turn a small advantage into downhill pressure.',
    playerRead: 'The cutter curls when the defender trails and fades when the defender shoots the gap.',
    adjustmentRead: 'Michigan top-locks the pindown, opening the baseline cut as the preferred counter.',
    video: {
      id: 'hDOJCa2v4vc',
      title: 'Auburn vs. Michigan — Sweet 16 extended highlights',
      sourceUrl: 'https://www.youtube.com/watch?v=hDOJCa2v4vc',
      sourceLabel: 'Official March Madness · March 28, 2025',
      starts: [16, 130, 248, 366, 484],
    },
    phases: phases('Wide pindown', 'Zoom action', 'Top lock', 'Baseline cut', 'The wing lowers toward the corner as the screener closes the gap.', [0.99, 1.05, 1.13, 1.02, 1.19], [43.1, 43.8, 44.9, 44.4, 45.6]),
  },
];
