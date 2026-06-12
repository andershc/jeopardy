import { mutation } from "./_generated/server";

// Seeds the "VM 2026" question set. Source of truth: convex/data/vm.csv
// Run with: npx convex run seed:seedWorldCup

const QUESTION_SET_NAME = "VM 2026";

const QUESTIONS: {
  category: string;
  text: string;
  answer: string;
  points: number;
}[] = [
  {
    category: "VM Historie",
    text: "I hvilket land ble det aller første fotball-VM arrangert i 1930?",
    answer: "Uruguay (som også vant)",
    points: 100,
  },
  {
    category: "VM Historie",
    text: "Hvilke to land har vunnet VM fire ganger hver?",
    answer: "Tyskland og Italia",
    points: 200,
  },
  {
    category: "VM Historie",
    text: 'Hvem scoret det beryktede "Hånden til Gud"-målet i 1986?',
    answer: "Diego Maradona",
    points: 300,
  },
  {
    category: "VM Historie",
    text: "Hva endte den beryktede semifinalen mellom Brasil og Tyskland i VM 2014?",
    answer: "1-7",
    points: 400,
  },
  {
    category: "VM Historie",
    text: "Hvem er den yngste spilleren som har scoret i en VM-finale?",
    answer: "Pelé (17 år, i 1958)",
    points: 500,
  },
  {
    category: "VM 2026",
    text: "Hvor mange lag deltar i VM 2026?",
    answer: "48",
    points: 100,
  },
  {
    category: "VM 2026",
    text: "Hvilke tre land arrangerer VM 2026?",
    answer: "USA, Canada og Mexico",
    points: 200,
  },
  {
    category: "VM 2026",
    text: "På hvilket stadion spilles VM-finalen 2026?",
    answer: "MetLife Stadium (New York/New Jersey)",
    points: 300,
  },
  {
    category: "VM 2026",
    text: "VM 2026 har tre maskoter. Nevn minst én av dem",
    answer: "Maple (elg), Zayu (jaguar) og Clutch (ørn)",
    points: 400,
  },
  {
    category: "VM 2026",
    text: "Hvor mange kamper spilles totalt i VM 2026?",
    answer: "104",
    points: 500,
  },
  {
    category: "Norge i VM",
    text: "Hvem var trener for Norge i VM 1998?",
    answer: 'Egil "Drillo" Olsen',
    points: 100,
  },
  {
    category: "Norge i VM",
    text: "Hvilket stort fotballand slo Norge 2-1 i gruppespillet i VM 1998?",
    answer: "Brasil",
    points: 200,
  },
  {
    category: "Norge i VM",
    text: "Hvem satte straffesparket som ga Norge seieren over Brasil i 1998?",
    answer: "Kjetil Rekdal",
    points: 300,
  },
  {
    category: "Norge i VM",
    text: "Hvilket lag slo Norge ut av VM 1998 i åttedelsfinalen?",
    answer: "Italia (0-1)",
    points: 400,
  },
  {
    category: "Norge i VM",
    text: "Norge deltok i VM allerede i 1938. Hvem slo oss ut da?",
    answer: "Italia (1-2 etter ekstraomganger)",
    points: 500,
  },
  {
    category: "Legender",
    text: "Hvem er den eneste spilleren som har vunnet VM tre ganger?",
    answer: "Pelé",
    points: 100,
  },
  {
    category: "Legender",
    text: "Hvilken fransk legende ble utvist i VM-finalen 2006 etter en skalle?",
    answer: "Zinedine Zidane",
    points: 200,
  },
  {
    category: "Legender",
    text: "Hvilken brasilianer er Brasils toppscorer i VM med 15 mål?",
    answer: "Ronaldo",
    points: 300,
  },
  {
    category: "Legender",
    text: "Hvem har spilt flest VM-kamper gjennom tidene?",
    answer: "Lionel Messi (26 kamper)",
    points: 400,
  },
  {
    category: "Legender",
    text: "Hvem ble i 2022 den første til å score i fem forskjellige VM-sluttspill?",
    answer: "Cristiano Ronaldo",
    points: 500,
  },
  {
    category: "Diverse",
    text: "Hvilken sang fremførte Shakira til VM i 2010?",
    answer: "Waka Waka (This Time for Africa)",
    points: 100,
  },
  {
    category: "Diverse",
    text: "Hva het blekkspruten som tippet VM-resultater i 2010?",
    answer: "Paul",
    points: 200,
  },
  {
    category: "Diverse",
    text: "Hva heter den offisielle VM-ballen i 2026?",
    answer: "Trionda",
    points: 300,
  },
  {
    category: "Diverse",
    text: "Hvem scoret tidenes raskeste VM-mål, etter bare 11 sekunder?",
    answer: "Hakan Sükür (Tyrkia, 2002)",
    points: 400,
  },
  {
    category: "Diverse",
    text: "Cirka hvor mange tilskuere så VM-finalen på Maracanã i 1950?",
    answer: "Ca. 200 000 (173 850 offisielt)",
    points: 500,
  },
];

export const seedWorldCup = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSets = await ctx.db.query("questionSets").collect();
    if (existingSets.some((set) => set.name === QUESTION_SET_NAME)) {
      return `Question set "${QUESTION_SET_NAME}" already exists, skipping`;
    }

    const questionSetId = await ctx.db.insert("questionSets", {
      name: QUESTION_SET_NAME,
    });

    for (const question of QUESTIONS) {
      await ctx.db.insert("questions", {
        ...question,
        questionSetId,
      });
    }

    return `Created "${QUESTION_SET_NAME}" with ${QUESTIONS.length} questions`;
  },
});
