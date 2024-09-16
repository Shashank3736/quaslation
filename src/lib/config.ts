export const DISCORD_INVITE_URL="https://discord.gg/9Z7bMGzDne"
export const MAIN_HOST = "https://quaslation.vercel.app"

export type UserRole = {
  [key: string]: "ADMIN" | "SUBSCRIBER" | "MEMBER";
}

export const userRoles:UserRole = {

}

export interface NovelChapter {
  novel: string;
  chapter: string;
}

export type NovelData = {
  [key: string]: NovelChapter;
};

export const chapterIdRedirect:NovelData = {
  "clzs2ada52b6507o5g60qhdhq": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "the-boy-who-was-2ada-1-1"
  },
  "clzs32acf2c0707o5267v4l5k": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "raise-your-rank-32ac-1-2"
  },
  "clzs3lc052czc07pnrsu8oe3n": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "rank-up-test-3lc0-1-3"
  },
  "clzs3zq3n2cjs07o5hc6q2l9k": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "rank-up-test-p-3zq3-1-4"
  },
  "clzs4qdfp2du207pn4q4x1cz7": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "its-okay-if-i-p-4qdf-1-5"
  },
  "clzs574642ert07pnr90203yv": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "however-the-ran-5746-1-6"
  },
  "clzs5meib2f5d07pnsbwnaoky": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "the-typical-plot-5mei-1-7"
  },
  "clzs65ygg2ewt07o5p84qjvzw": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "revenge-on-the-a-65yg-1-8"
  },
  "clzs8bcl32gmr07o5d4vbz8z7": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "encouraging-refl-8bcl-1-9"
  },
  "clzs8pda62hym07pnqi228ntx": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "harassment-mat-8pda-1-10"
  },
  "clzs936sf005707plgwmxlc2b": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "i-tried-to-sabot-936s-1-11"
  },
  "clzs9d8aq00fq07plug0gzdfp": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "hunting-is-a-sid-9d8a-1-12"
  },
  "clzscmul503td07pi1169wph5": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "the-end-of-fooli-cmul-1-13"
  },
  "clzscw6gl040a07pinymxkz6u": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "ryu-poisoned-cw6g-1-14"
  },
  "clzsd8z9l048z07pi7kc84all": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "the-declining-ad-d8z9-1-15"
  },
  "clzsdi4sa04e707pi4k6dl3gw": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "ryuujin-is-ensla-di4s-1-16"
  },
  "clzsdpikx04j207pixum3iebc": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "ryuujin-becomes-dpik-1-17"
  },
  "clzsdwcrj04wb07piyogzo73t": {
    "novel": "a-boy-who-was-left-behind-in-a-dungeon",
    "chapter": "ryu-teams-up-wit-dwcr-1-18"
  },
  "clwgbykrl01lj07ocuo27slhl": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "im-the-heroic-knight-of-an-intergalactic-empire-prologue"
  },
  "clwgc1tkc01o007oce53t0mpi": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "asteroid-neia-2-1"
  },
  "clwgc3uss01rn07o2evg350d7": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "mercenary-2-2"
  },
  "clwgryui80ami07oce8xmdb5w": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "genius-2-3"
  },
  "clwgs50bh0aw107o26k9xgcnc": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "self-destruction-2-4"
  },
  "clwgs9gx50b2407o27bv97zoz": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "development-cancelled-2-5"
  },
  "clwgsdj110b8607ocj2nomwha": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "joint-development-2-6"
  },
  "clwgsgrkv0bca07oc7abednxy": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "battle-inside-the-asteroid-2-7"
  },
  "clwhjqtly0ny307ocnayj3cnn": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "gold-raccoon-2-8"
  },
  "clwhk25pc0o7z07ocds5xzp40": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "overload-2-9"
  },
  "clwhk4sft0oac07oc7paam8fz": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "what-is-a-knight-2-10"
  },
  "clwhk73m40oae07o2qbe06arp": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "dissolution-2-11"
  },
  "clwhk98v60ofy07oc229z12lk": {
    "novel": "im-the-heroic-knight-of-an-intergalactic-empire",
    "chapter": "epilogue-12lk-2-12"
  }
}