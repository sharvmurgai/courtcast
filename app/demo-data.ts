export type Probability = { label: string; value: number };

export type TrackingFrame = {
  at: number;
  shotClock: number;
  stage: string;
  read: string;
  actions: Probability[];
  coverages: Probability[];
  confidence: number;
  epv: number;
  winProbability: number;
  offense: [number, number][];
  defense: [number, number][];
  ballOwner: number;
};

export type PlayAudit = {
  id: string;
  start: number;
  end: number;
  gameClock: string;
  offense: string;
  defense: string;
  predicted: string;
  actual: string;
  correct: boolean;
  result: string;
  counter: string;
  coverage: string;
  why: string;
  auditStatus: 'aligned' | 'reviewed' | 'hypothesis';
  frames: TrackingFrame[];
};

export type TeamProfile = {
  name: string;
  code: string;
  coach: string;
  identity: string;
  defense: string;
  adjustment: string;
};

export type DemoGame = {
  id: string;
  league: 'NBA' | 'NCAA';
  label: string;
  away: TeamProfile;
  home: TeamProfile;
  date: string;
  venue: string;
  sourceNote: string;
  video: { id: string; title: string; sourceUrl: string; sourceLabel: string };
  defenseExpectation: string;
  overallPrediction: string;
  playbook: { label: string; count: number }[];
  plays: PlayAudit[];
};

const shapes = [
  [
    [[53, 9], [56, 41], [64, 25], [78, 12], [79, 38]],
    [[56, 11], [59, 38], [68, 25], [82, 15], [82, 35]],
  ],
  [
    [[58, 8], [57, 42], [68, 25], [77, 14], [82, 34]],
    [[61, 11], [61, 39], [71, 24], [81, 17], [85, 32]],
  ],
  [
    [[62, 7], [61, 42], [73, 22], [80, 15], [85, 33]],
    [[65, 10], [65, 39], [75, 24], [83, 17], [87, 31]],
  ],
  [
    [[66, 8], [68, 40], [78, 20], [83, 13], [87, 30]],
    [[69, 11], [71, 37], [80, 23], [85, 16], [89, 29]],
  ],
  [
    [[69, 9], [75, 38], [82, 18], [86, 12], [90, 27]],
    [[72, 12], [77, 35], [83, 22], [88, 15], [91, 28]],
  ],
] as const;

function frameSet(
  predicted: string,
  alternate: string,
  coverage: string,
  counter: string,
  read: string,
  variant: number,
  epv: number,
  win: number,
): TrackingFrame[] {
  const top = [35, 47, 61, 73, 81];
  const stages = ['Shape forming', 'Trigger developing', 'Action recognized', 'Coverage commits', 'Counter window'];

  return shapes.map((shape, index) => {
    const flip = variant % 2 === 1;
    const drift = (variant % 3) - 1;
    const move = (points: readonly (readonly [number, number])[]) =>
      points.map(([x, y], player) => [
        Math.max(49, Math.min(92, (flip ? 143 - x : x) + drift * (player % 2 ? 0.7 : -0.35))),
        Math.max(3, Math.min(47, y + ((variant + player + index) % 3 - 1) * 0.7)),
      ] as [number, number]);
    const first = top[index];
    const second = Math.max(8, 32 - index * 4);
    const third = Math.max(5, 19 - index * 2);
    const fourth = 100 - first - second - third;
    const switchValue = Math.max(9, 31 - index * 4);
    const dropValue = Math.max(7, 22 - index * 3);
    const coverageTop = Math.min(78, 39 + index * 9);

    return {
      at: index * 3,
      shotClock: 21 - index * 4,
      stage: stages[index],
      read: index < 2 ? read : index === 2 ? `${predicted} is now the leading geometry.` : `${coverage} changes the highest-value branch.`,
      actions: [
        { label: predicted, value: first },
        { label: alternate, value: second },
        { label: counter, value: third },
        { label: 'Other', value: fourth },
      ],
      coverages: [
        { label: coverage, value: coverageTop },
        { label: 'Switch', value: switchValue },
        { label: 'Drop / contain', value: dropValue },
        { label: 'Other', value: 100 - coverageTop - switchValue - dropValue },
      ],
      confidence: first,
      epv: epv + [0, 0.03, 0.08, -0.02, 0.12][index],
      winProbability: win + [0, 0.3, 0.8, 0.4, 1.2][index],
      offense: move(shape[0]),
      defense: move(shape[1]),
      ballOwner: [0, 0, 2, 2, 4][index],
    };
  });
}

function play(
  id: string,
  start: number,
  end: number,
  gameClock: string,
  offense: string,
  defense: string,
  predicted: string,
  actual: string,
  correct: boolean,
  result: string,
  coverage: string,
  counter: string,
  why: string,
  variant: number,
  epv: number,
  win: number,
  auditStatus: PlayAudit['auditStatus'] = 'reviewed',
): PlayAudit {
  const alternate = actual === predicted ? (counter === predicted ? 'Isolation' : counter) : actual;
  return {
    id, start, end, gameClock, offense, defense, predicted, actual, correct, result, counter, coverage, why, auditStatus,
    frames: frameSet(predicted, alternate, coverage, counter, why, variant, epv, win),
  };
}

export const games: DemoGame[] = [
  {
    id: 'okc-ind-2025-g7', league: 'NBA', label: 'Finals · G7', date: 'June 22, 2025', venue: 'Paycom Center',
    away: { name: 'Indiana Pacers', code: 'IND', coach: 'Rick Carlisle', identity: 'Tempo, early drag screens, paint-to-perimeter passing', defense: 'Nail help with aggressive low-man rotations', adjustment: 'Change the screen angle and re-enter through Siakam when the first side is loaded.' },
    home: { name: 'Oklahoma City Thunder', code: 'OKC', coach: 'Mark Daigneault', identity: 'Five-out spacing, guard screening, drive-and-kick chains', defense: 'Pressure at the point of attack; late switching behind it', adjustment: 'Use Caruso as screener and attack the second defender before Indiana can set its shell.' },
    video: { id: 'aVbpFUtTCUg', title: 'Oklahoma City vs. Indiana — 2025 Finals Game 7', sourceUrl: 'https://www.youtube.com/watch?v=aVbpFUtTCUg', sourceLabel: 'NBA ArchiveYT full-game upload' },
    sourceNote: 'Five windows were aligned to the broadcast clock and official play-by-play; tactical names remain film-review hypotheses.',
    defenseExpectation: 'OKC pressure pushes Indiana toward early releases; Indiana answers by shrinking the lane and tagging from the nail.',
    overallPrediction: 'The possession tree should favor high ball screens, second-side drives, and fast kick-outs over static isolation.',
    playbook: [{ label: 'Ball screen', count: 2 }, { label: 'DHO / pistol', count: 1 }, { label: 'Drive + kick', count: 1 }, { label: 'Ghost / slip', count: 1 }],
    plays: [
      play('OKC-01', 1200, 1218, 'Q1 · 5:36', 'OKC', 'IND', 'High pick-and-roll', 'High pick-and-roll', true, 'Caruso missed driving layup; Turner defensive rebound', 'Drop with nail help', 'Weak-side lift', 'A high screen threat clears the top and sends the handler downhill.', 0, 1.03, 50.0, 'aligned'),
      play('IND-02', 1218, 1237, 'Q1 · 5:19', 'IND', 'OKC', 'High ball screen', 'High ball screen', true, 'Haliburton bad-pass turnover; Caruso steal', 'At-level pressure', 'Short roll', 'The five rises above the arc as OKC crowds the handler and first passing lane.', 1, 0.98, 50.0, 'aligned'),
      play('OKC-03', 3601, 3626, 'Q3 · 11:14', 'OKC', 'IND', 'Dribble handoff', 'Dribble handoff', true, 'Missed wing three; offensive rebound', 'Switch', 'Reject handoff', 'A close perimeter exchange precedes the weak-side lift and three-point attempt.', 2, 1.08, 56.2, 'aligned'),
      play('IND-04', 3637, 3647, 'Q3 · 10:39', 'IND', 'OKC', 'Second-chance kick-out', 'Second-chance kick-out', true, 'Blocked floater, offensive rebound, Siakam made three', 'Paint collapse', 'Slot three', 'The blocked drive bends all five defenders before the rebound is sprayed to the perimeter.', 3, 1.14, 48.3, 'aligned'),
      play('OKC-05', 3652, 3690, 'Q3 · 10:24', 'OKC', 'IND', 'Spain pick-and-roll', 'Ghost / slip screen', false, 'Nesmith personal foul during the continuation', 'Show and recover', 'Empty-corner drive', 'A third-player screen is plausible, but the film does not establish Spain cleanly; the slip is the safer review.', 4, 1.05, 56.8, 'aligned'),
    ],
  },
  {
    id: 'nyk-bos-2025-g6', league: 'NBA', label: 'East Semis · G6', date: 'May 16, 2025', venue: 'Madison Square Garden',
    away: { name: 'Boston Celtics', code: 'BOS', coach: 'Joe Mazzulla', identity: 'Five-out spacing, quick slips, high three-point volume', defense: 'Switch-heavy shell with selective pressure', adjustment: 'Slip before the switch arrives, then drive the closeout on the second side.' },
    home: { name: 'New York Knicks', code: 'NYK', coach: 'Tom Thibodeau', identity: 'Brunson-led pick-and-roll, empty-side attacks, offensive rebounding', defense: 'Load the nail, protect the paint, finish possessions on the glass', adjustment: 'Clear a side for Brunson and punish the low tag with a corner lift.' },
    video: { id: 'M-tereZws1Q', title: 'New York vs. Boston — 2025 Eastern Semifinals Game 6', sourceUrl: 'https://www.youtube.com/watch?v=M-tereZws1Q', sourceLabel: 'NBA ArchiveYT full-game upload' },
    sourceNote: 'Five complete half-court windows were selected from the full broadcast and reviewed at normal speed and frame steps.',
    defenseExpectation: 'Boston’s switching removes the first screen; New York’s best answer is a re-screen, seal, or immediate second-side attack.',
    overallPrediction: 'Expect Brunson ball screens to pull help toward the nail, creating corner and slot decisions one pass later.',
    playbook: [{ label: 'Empty PNR', count: 2 }, { label: 'Horns', count: 1 }, { label: 'Post split', count: 1 }, { label: 'Wide pindown', count: 1 }],
    plays: [
      play('NYK-01', 710, 729, 'Q1 · 5:17', 'NYK', 'BOS', 'Empty-corner pick-and-roll', 'Empty-corner pick-and-roll', true, 'Brunson uses the high screen and pulls Boston’s second line toward the ball', 'Switch', 'Re-screen', 'The strong-side corner empties before the screener arrives at the handler’s hip.', 1, 1.06, 51.2),
      play('BOS-02', 1070, 1089, 'Q1 · 2:17', 'BOS', 'NYK', 'High pick-and-roll', 'High pick-and-roll', true, 'The handler turns the corner before New York recovers', 'At-level show', 'Short roll', 'The screener rises above the arc and opens a middle lane against New York’s set shell.', 2, 1.11, 47.6),
      play('NYK-03', 2150, 2169, 'Q2 · 5:39', 'NYK', 'BOS', 'Early drag screen', 'Early drag screen', true, 'New York enters quickly and attacks before the matchup is fully set', 'Switch', 'Screen reject', 'The trailing big approaches the ball as the offense crosses into the frontcourt.', 3, 1.02, 54.4),
      play('BOS-04', 3590, 3609, 'Q3 · 8:27', 'BOS', 'NYK', 'High pick-and-roll', 'High pick-and-roll', true, 'The high screen creates a paint touch against a loaded lane', 'Drop with nail help', 'Weak-side lift', 'Boston clears the top and brings the five directly into the handler’s path.', 4, 1.09, 42.8),
      play('NYK-05', 4550, 4569, 'Q3 · 0:19', 'NYK', 'BOS', 'Empty-corner pick-and-roll', 'Isolation', false, 'The handler keeps the matchup and attacks without using the arriving screen', 'Gap help', 'Slot kick-out', 'The spacing resembles empty pick-and-roll, but the ball stays in a one-on-one branch.', 0, 1.08, 69.1),
    ],
  },
  {
    id: 'min-gsw-2025-g5', league: 'NBA', label: 'West Semis · G5', date: 'May 14, 2025', venue: 'Target Center',
    away: { name: 'Golden State Warriors', code: 'GSW', coach: 'Steve Kerr', identity: 'Split cuts, wide actions, screening by guards', defense: 'Switch and pre-switch around movement shooters', adjustment: 'Use the screener as a passer and turn top-locks into back cuts.' },
    home: { name: 'Minnesota Timberwolves', code: 'MIN', coach: 'Chris Finch', identity: 'Edwards downhill attacks, delay entries, Gobert screening', defense: 'Deep rim protection with long wings at the nail', adjustment: 'Empty a side for Edwards and force the low man to choose between Gobert and the corner.' },
    video: { id: 'mt5h1UYWNX0', title: 'Minnesota vs. Golden State — 2025 Western Semifinals Game 5', sourceUrl: 'https://www.youtube.com/watch?v=mt5h1UYWNX0', sourceLabel: 'NBA ArchiveYT full-game upload' },
    sourceNote: 'Five set-possession windows were selected from the full game; tracking dots are reconstructed from their visible spacing.',
    defenseExpectation: 'Minnesota can stay attached through off-ball traffic because Gobert anchors the paint; Golden State must create indecision with slips and cuts.',
    overallPrediction: 'Minnesota’s cleanest branch is Edwards–Gobert screening; Golden State’s is split action flowing into a back cut.',
    playbook: [{ label: 'Split action', count: 1 }, { label: 'Angle PNR', count: 2 }, { label: 'Delay DHO', count: 1 }, { label: 'Chicago action', count: 1 }],
    plays: [
      play('MIN-01', 710, 729, 'Q1 · 4:58', 'MIN', 'GSW', 'High pick-and-roll', 'High pick-and-roll', true, 'Minnesota uses the middle screen to force a second defender into the lane', 'At-level show', 'Pocket pass', 'The screener arrives from the slot while both corners hold their spacing.', 2, 1.01, 45.8),
      play('GSW-02', 820, 839, 'Q1 · 3:21', 'GSW', 'MIN', 'Wide pindown', 'Wide pindown', true, 'The cutter uses the low screen and catches above the break', 'Trail', 'Backdoor cut', 'The off-ball receiver starts near the baseline and climbs off a wide screening angle.', 3, 1.13, 56.1),
      play('GSW-03', 1310, 1329, 'Q2 · 10:18', 'GSW', 'MIN', 'Angle pick-and-roll', 'Angle pick-and-roll', true, 'The screen pulls Gobert away from the rim before the ball is released', 'Drop', 'Short roll', 'The ball screen arrives from the slot with the weak-side defense already flattened.', 4, 1.08, 58.4),
      play('MIN-04', 2150, 2169, 'Q2 · 2:54', 'MIN', 'GSW', 'Empty-corner pick-and-roll', 'Empty-corner pick-and-roll', true, 'The empty side lets the handler turn the corner without a strong-side tag', 'Switch', 'Screen reject', 'Minnesota removes the corner before bringing the screener toward the sideline.', 0, 1.07, 39.7),
      play('GSW-05', 2870, 2889, 'Q3 · 2:56', 'GSW', 'MIN', 'Split action', 'High pick-and-roll', false, 'Golden State settles into a conventional high screen instead of the predicted post split', 'Drop', 'Short roll', 'The initial alignment suggests split action, but the post never receives the ball and the five screens up top.', 1, 1.10, 72.5),
    ],
  },
  {
    id: 'uk-duke-2024', league: 'NCAA', label: 'Champions Classic', date: 'November 12, 2024', venue: 'State Farm Arena',
    away: { name: 'Kentucky Wildcats', code: 'UK', coach: 'Mark Pope', identity: 'Five-out pace, rapid reversals, zoom and flare entries', defense: 'Show bodies early, recover to shooters', adjustment: 'Reverse twice before screening so the defense cannot load to the first handler.' },
    home: { name: 'Duke Blue Devils', code: 'DUKE', coach: 'Jon Scheyer', identity: 'Horns spacing, size-led creation, matchup seals', defense: 'Switchable length with aggressive nail help', adjustment: 'Use the second big as a spacer and seal smaller switches after the first action.' },
    video: { id: 'bTDvVcEedIU', title: 'Kentucky vs. Duke — 2024 Champions Classic', sourceUrl: 'https://www.youtube.com/watch?v=bTDvVcEedIU', sourceLabel: 'O__BALL__O full-game upload' },
    sourceNote: 'Five half-court possessions were reviewed from a full-game community upload; labels are analyst hypotheses, not team terminology.',
    defenseExpectation: 'Duke’s length can flatten the first drive; Kentucky needs reversals and screening away from the initial point of attack.',
    overallPrediction: 'Kentucky should lean on zoom and five-out cuts, while Duke uses horns to manufacture a size mismatch.',
    playbook: [{ label: 'Zoom', count: 2 }, { label: 'Horns', count: 1 }, { label: 'Iverson cut', count: 1 }, { label: 'Ghost screen', count: 1 }],
    plays: [
      play('UK-01', 596, 612, '1H · 17:32', 'UK', 'DUKE', 'Five-out drive', 'Five-out drive', true, 'Kentucky attacks the tilted lane from an empty top', 'Gap help', 'Corner replace', 'All five offensive players begin outside the lane before the first downhill move.', 2, 1.09, 46.9),
      play('DUKE-02', 1540, 1559, '1H · 12:08', 'DUKE', 'UK', 'High ball screen', 'High ball screen', true, 'The handler uses the high screen and forces a late contest', 'Drop', 'Short roll', 'Duke brings a single high screener into an otherwise spread alignment.', 3, 1.14, 58.0),
      play('DUKE-03', 2020, 2036, '1H · 8:24', 'DUKE', 'UK', 'Pindown catch', 'Pindown catch', true, 'The receiver arrives square and releases before the defense recovers', 'Trail and show', 'Curl cut', 'The shooter’s catch follows an off-ball route into the wing window.', 4, 1.05, 42.6),
      play('DUKE-04', 3580, 3599, '2H · 15:14', 'DUKE', 'UK', 'Empty-corner pick-and-roll', 'Empty-corner pick-and-roll', true, 'The screen creates a lane touch and draws the low defender', 'Switch call', 'Corner replace', 'The strong-side corner is vacant as the screen arrives outside the lane line.', 0, 1.12, 61.3),
      play('UK-05', 4918, 4937, '2H · 7:09', 'UK', 'DUKE', 'Spain pick-and-roll', 'Zoom action', false, 'The receiver comes off an exchange rather than back-screening the roll defender', 'Drop', 'Pocket pass', 'The third player enters the ball exchange; the film does not show a clean back-screen for Spain.', 1, 1.17, 48.8),
    ],
  },
  {
    id: 'aub-uk-2025', league: 'NCAA', label: 'SEC · Game 29', date: 'March 1, 2025', venue: 'Rupp Arena',
    away: { name: 'Auburn Tigers', code: 'AUB', coach: 'Bruce Pearl', identity: 'Fast layered actions, rim pressure, inside-out play', defense: 'Point-of-attack heat with early help', adjustment: 'Flow from a denied pindown into a baseline cut before the defense can reset.' },
    home: { name: 'Kentucky Wildcats', code: 'UK', coach: 'Mark Pope', identity: 'Five-out pace, early drag screens, quick decisions', defense: 'Contain the ball and rotate from length', adjustment: 'Use a second reversal and empty-side drive when Auburn overloads the first action.' },
    video: { id: '1DAPSolAIp8', title: 'Auburn vs. Kentucky — 2025 SEC regular season', sourceUrl: 'https://www.youtube.com/watch?v=1DAPSolAIp8', sourceLabel: 'O__BALL__O full-game upload' },
    sourceNote: 'Five possessions were selected from the complete broadcast; the demo preserves the whole-game context around each jump point.',
    defenseExpectation: 'Auburn will speed up the first read and force Kentucky into counters; Kentucky’s spacing tests Auburn’s longest rotation.',
    overallPrediction: 'The recurring contest is Auburn pressure versus Kentucky’s second-side decision-making after the first screen is denied.',
    playbook: [{ label: 'Wide pindown', count: 1 }, { label: 'Drag PNR', count: 2 }, { label: 'Flare screen', count: 1 }, { label: 'Drive + kick', count: 1 }],
    plays: [
      play('AUB-01', 820, 839, '1H · 14:42', 'AUB', 'UK', 'High ball screen', 'High ball screen', true, 'The handler turns the corner and the possession finishes at the rim', 'Drop', 'Short roll', 'Auburn spreads the floor and brings the five directly to the ball above the arc.', 3, 1.08, 52.1),
      play('AUB-02', 1798, 1817, '1H · 8:41', 'AUB', 'UK', 'Early drag screen', 'Early drag screen', true, 'The trailing screen attacks Kentucky before the shell is organized', 'Weak', 'Screen reject', 'The screener arrives during the flow into the frontcourt rather than after a static entry.', 4, 1.11, 47.4),
      play('AUB-03', 2390, 2409, '1H · 5:46', 'AUB', 'UK', 'Flare screen', 'Flare screen', true, 'The off-ball screen opens the weak-side catch', 'Switch', 'Slip flare', 'The slot player turns away from the ball and screens a teammate into open space.', 0, 1.13, 56.0),
      play('AUB-04', 3830, 3849, '2H · 12:02', 'AUB', 'UK', 'Empty-corner pick-and-roll', 'Empty-corner pick-and-roll', true, 'The handler attacks the vacated side and pulls help below the foul line', 'Drop', 'Corner replace', 'The strong-side corner clears before the ball screen arrives.', 1, 1.16, 43.7),
      play('UK-05', 4910, 4929, '2H · 5:10', 'UK', 'AUB', 'Drive and kick', 'Drive and kick', true, 'A paint touch contracts Auburn and produces the perimeter release', 'Paint collapse', 'One-more pass', 'Kentucky attacks the first closeout and moves the ball as the defense collapses.', 2, 1.18, 64.2),
    ],
  },
];

export const totalAuditedPlays = games.reduce((total, game) => total + game.plays.length, 0);
export const totalCorrectPlays = games.flatMap((game) => game.plays).filter((playItem) => playItem.correct).length;
