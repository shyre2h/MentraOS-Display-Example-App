export interface Song {
  title: string;
  lyrics: string[];
  searchTerms: string[];
  language?: string;
  category?: string;
}

export const songsDatabase: Song[] = [
  {
    title: "Mogal Thay Madi",
    lyrics: [
      "Khodal thai madi",
      "Madhda ni sonal thai madi",
      "Nagal thai madi", 
      "Aadi avad thai madi",
      "Dhan bhagya amara manidhar mogal thai madi",
      "A dhan bhagya amara amane mogal madi",
      "Aakhi duniya che khoti",
      "Ek sachi mogal",
      "Aakhi duniya che khoti",
      "Ej sachi mogal"
    ],
    searchTerms: ["mogal", "madi", "khodal", "sonal", "bhagya"],
    language: "Gujarati",
    category: "Traditional"
  },
  {
    title: "Bhuvapani",
    lyrics: [
      "bhuvapani karva jyata bhuva mara",
      "Alya bhai bhuvapani karva jyata bhuva mara",
      "Pasi dodh aali dhunva aaya mata mara",
      "AY! Daacheno na deshmo, komaroo deshmo",
      "Khabe nokhyo kheh na paghdi waala vesh mo",
      "Bhuvaji aavta ta, mata ne laavta ta",
      "Pasi jena jena ghughra vaagta ta"
    ],
    searchTerms: ["bhuvapani", "bhuva", "mata", "ghughra", "dodh"],
    language: "Gujarati",
    category: "Folk"
  },
  {
    title: "Akkar Chakar",
    lyrics: [
      "Akar chakar gol chakar bhammaradi re",
      "Bhammaradi re bhammaradi re",
      "Ae akar chakar gol chakar bhammaradi re",
      "Tari mari jodi jabbar bhammaradi re",
      "Amar aapni dosti duniya aakhi jonati",
      "Ha ahn hove ha ahn hove"
    ],
    searchTerms: ["akkar", "chakar", "bhammaradi", "jodi", "dosti"],
    language: "Gujarati", 
    category: "Contemporary"
  },
  {
    title: "Hu Ru Ru",
    lyrics: [
      "O re jaago jaago jaago",
      "O re Kishan Kanhaiya jaago",
      "Teri maai maakhan laayi",
      "Mhaara Kishan Kanhaiya chhaakho",
      "Are hu ru ru ru hu ru ru ru",
      "Tane hu ru ru ru hu ru ru ru"
    ],
    searchTerms: ["hu ru ru", "kishan", "kanhaiya", "maakhan", "jaago"],
    language: "Hindi/Gujarati",
    category: "Devotional"
  },
  {
    title: "Charan Ni Sarkar",
    lyrics: [
      "He tu toh charan ni sarkar re",
      "Sonbai madhda vadi",
      "Tane bhaje maa",
      "He tane bhaje ma aaj tola baal re",
      "Sonbai madhda vadi",
      "He tu charan no",
      "Sangar re sonbai madhda vadi"
    ],
    searchTerms: ["charan", "sarkar", "sonbai", "madhda", "bhaje"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "Mari Aankhe Ujagara",
    lyrics: [
      "Vhaala aato vaalapanu chhe vahaan",
      "He ane paar tu utaar",
      "Maari aankhe ujaagara, di ne raat",
      "Kyaa rami aavya Kaan Raatladi",
      "Vhaala thodo harakh to dekhaad",
      "Balelaane naa tu baal"
    ],
    searchTerms: ["aankhe", "ujagara", "raat", "kaan", "raatladi"],
    language: "Gujarati",
    category: "Classical"
  },
  {
    title: "Mujo Veero Re Parne",
    lyrics: [
      "Mujo veero re parne",
      "Veer chagaldo parne",
      "Mujo veero re parne", 
      "Veer ladakdo parne",
      "Vage dhol ne sharnayu",
      "Veer ladakdo parne",
      "Veera na mama avse",
      "Mamera dipavshe"
    ],
    searchTerms: ["veero", "parne", "dhol", "sharnayu", "mama"],
    language: "Gujarati",
    category: "Wedding"
  },
  {
    title: "Ghanan Ghanan",
    lyrics: [
      "Ghanan Ghanan Ghan",
      "Ghanan Ghanan Ghir Ghir Aaye badra",
      "Ghane ghan ghor kare chhaye badra",
      "dhamak dhamak gunje badra ke danke",
      "chamak chamak dekho bijuriya chamke",
      "mann dhadkaye badarva",
      "kale megha, kale megha",
      "paani to barsaao"
    ],
    searchTerms: ["ghanan", "ghan", "badra", "megha", "barsaao"],
    language: "Hindi",
    category: "Classical"
  },
  {
    title: "Pardesiya",
    lyrics: [
      "O pardesiya",
      "Pardesiya yeh sach hai piya",
      "Sab kehte hain maine tujhko dil de diya",
      "Main kehti hoon tune mera dil le liya",
      "Phoolon mein kaliyon mein gaaon ki galiyon mein",
      "Hum dono badnaam hone lage hain"
    ],
    searchTerms: ["pardesiya", "piya", "dil", "phoolon", "badnaam"],
    language: "Hindi",
    category: "Bollywood"
  },
  {
    title: "Kajra Re",
    lyrics: [
      "Kajraa re kajraa re kajraa re tere kaare kaare naina",
      "Ho mere naina mere naina mere naina judawaan naina",
      "Suramein se likhe tere vaade aankhon kee zabaani aathe hain",
      "Mere rumaalon pe lab tere baandh ke nishaani jaathe hain"
    ],
    searchTerms: ["kajra", "naina", "kaare", "vaade", "rumalon"],
    language: "Hindi",
    category: "Bollywood"
  },
  {
    title: "Chogada Tara",
    lyrics: [
      "Ho aayi gayi raat",
      "Mann bhulo bhadi baat", 
      "Prem niya mausam che",
      "Ab aao mere paas",
      "Reh jaao mere saath",
      "Chogada tara",
      "Chabila tara",
      "Rangila tara",
      "Rangbheru jue tari vaat re"
    ],
    searchTerms: ["chogada", "tara", "chabila", "rangila", "mausam"],
    language: "Gujarati/Hindi",
    category: "Garba"
  },
  {
    title: "Ramta Jogi",
    lyrics: [
      "Naa jaane dil vich kee aaya, ek prem payaala pee aaya",
      "Mai jee aaya mai ji aaya, mai prem payaala pee aaya",
      "Oye rabta jogee oye ramta jogee, hoi hoi hoi hoi",
      "Mai prem da payaala pee aaya",
      "ek pal me sadiya jee aaya"
    ],
    searchTerms: ["ramta", "jogi", "prem", "payaala", "sadiya"],
    language: "Punjabi",
    category: "Sufi"
  },
  {
    title: "Acho Pakhi Pardesida",
    lyrics: [
      "Acho Pakhi Pardesida",
      "Toke sine sa milaya",
      "sine sa milaya",
      "Toke haal anthar jaa bhudaya",
      "Diin thaka thaka thaka diin thaka thaka thaka din thaka thaka thaka DHA DHA DHA!"
    ],
    searchTerms: ["acho", "pakhi", "pardesida", "sine", "milaya"],
    language: "Kutchi",
    category: "Regional"
  },
  {
    title: "Mathura Ma Vagu Morli",
    lyrics: [
      "He Mathura ma vagi morli, Gokul ma kem revay duvay Ranchhodji",
      "Sona na hin dole, Dwarka ma diva bale",
      "Utara desu, orda desu, medi na mol",
      "Raghu Ranchhodji!",
      "He datan desu, dalmi, pittaliya lota desh"
    ],
    searchTerms: ["mathura", "morli", "gokul", "ranchhod", "dwarka"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "Hare Vala Arji Amari",
    lyrics: [
      "Hare Vahla Araji Amari, Suno Shreenathji, Lai Jaje Tara Dham Ma",
      "Hare Mara Anta Samay Na Beli",
      "Hare Havve Melo Nahi Hadaseli",
      "Hare Hu To Aavi Ubho-Tara Dware Shreenathji",
      "Hare Tame Karuna Tana Cho Sindhu"
    ],
    searchTerms: ["hare", "vala", "arji", "shreenathji", "dham"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "Govind Bolo Hari Gopal",
    lyrics: [
      "Govind Bolo, Hari Gopal Bolo",
      "Radha Raman Hari Govind Bolo",
      "Brahma Ki Jai Jai, Vishnu Ki Jai Jai",
      "O Gyan Ki Devi Saraswati Ki Jai Jai",
      "Ramji Ki Jai Jai, Lakshman Ji Ki Jai Jai"
    ],
    searchTerms: ["govind", "hari", "gopal", "radha", "raman"],
    language: "Hindi",
    category: "Devotional"
  },
  {
    title: "Dwarika No Nath",
    lyrics: [
      "Dwarika no nath maro raja ranchod che",
      "Ane mane maya lagadi re",
      "Ane mane maya re lagadi mara wala",
      "Radhaji no shyaam maro giridhar gopal che",
      "Makhan no chor maro giridhar gopal che"
    ],
    searchTerms: ["dwarika", "nath", "raja", "ranchod", "maya"],
    language: "Gujarati", 
    category: "Devotional"
  },
  {
    title: "Tali Pado",
    lyrics: [
      "Tali paado to mara Ram ni re",
      "biji tali na hoy jo",
      "Vaatu karo to mara Ram ni re",
      "biji vaatu na hoy jo", 
      "Samran karo to Sitaram na re",
      "bija samran na hoy jo",
      "Bachpan, bachpan maa ghano fer chhe re"
    ],
    searchTerms: ["tali", "pado", "ram", "vaatu", "samran"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "Kanaiya Morli Vala Re",
    lyrics: [
      "Kanaiya morli vala re, valida morli vala re",
      "Tame jasho dana jaya re, kanaiya morli vala re",
      "Tame lago vala vala vala vala vala lago vala re",
      "Tame rang na kala re, kanaiya morli vala re"
    ],
    searchTerms: ["kanaiya", "morli", "vala", "jasho", "rang"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "Kanji Kado (Mathura Mathura)",
    lyrics: [
      "Kanji kado morli vado",
      "Gayo no goval",
      "Dwarika no",
      "Dwarika no Raja",
      "Enu mathura mathura mathura AYYEE",
      "Are janmyoo eto jail maa enu nam chhe jadavraai"
    ],
    searchTerms: ["kanji", "kado", "morli", "mathura", "goval"],
    language: "Gujarati",
    category: "Devotional"
  },
  {
    title: "I Am Very Sorry Kana",
    lyrics: [
      "I am very very very very very very",
      "I am very very sorry kana tane bhuli Gai",
      "Hey tane bhuli gai tane bhuli gai",
      "taro ghumtu makhand levu huto amul dairy guy",
      "Hutu amul dairy guy maro pakhan bhuli gai"
    ],
    searchTerms: ["sorry", "kana", "bhuli", "gai", "makhand"],
    language: "English/Gujarati",
    category: "Comedy"
  },
  {
    title: "Baby Ne Bournvita",
    lyrics: [
      "Ho, risani chhe jaanu mari, bolti nathi vala",
      "Bolvani cham tame badha lidhi re vala",
      "Baby ne Bournvita pivdavo, baby mood mood mood",
      "Ha, baby ne Bournvita pivdavo, baby mood ma nathi",
      "Na hot ke cold tame coffee pidhi"
    ],
    searchTerms: ["baby", "bournvita", "risani", "jaanu", "mood"],
    language: "Gujarati",
    category: "Contemporary"
  },
  {
    title: "Main Nikla Gaddi Le Ke",
    lyrics: [
      "Main Nikla Oh Gaddi Le Ke",
      "Oh Raste Par Oh Sadak Mein",
      "Ek Mod Aaya Main Uthe Dil Chhod Aaya",
      "Rab Jaane Kab Guzra Amritsar",
      "Oh Kab Jaane Lahore Aaya",
      "Us Mod Pe Woh Muti Yaar Mili"
    ],
    searchTerms: ["nikla", "gaddi", "mod", "dil", "chhod"],
    language: "Punjabi",
    category: "Folk"
  },
  {
    title: "Khaike Paan Banaras Wala",
    lyrics: [
      "Khaike paan banaras wala",
      "Khuli jaaye band aqal ka tala",
      "Arre bhang ka rang jama ho chaka-chak",
      "Phir lo paan chabaye",
      "Arre aisa jhatka lage jiya pe",
      "Punar janam hoyi jaaye"
    ],
    searchTerms: ["khaike", "paan", "banaras", "aqal", "tala"],
    language: "Hindi",
    category: "Classical"
  },
  {
    title: "Gajiyo Mujho Jor",
    lyrics: [
      "Gajiyo munjo jor jalanu",
      "Gajiyo munjo jor jalanu",
      "Jala maine juliaan",
      "Bhen Gajiyo te gaaiyaan",
      "Bhen Gajiyo ji gaaiyaan"
    ],
    searchTerms: ["gajiyo", "jor", "jalanu", "juliaan", "gaaiyaan"],
    language: "Kutchi",
    category: "Regional"
  },
  {
    title: "Chalde Aii Rulai",
    lyrics: [
      "O chalade aai rulaai",
      "Muke yada sajanaji aai",
      "chalade aai rulaai",
      "jinjal jinjal jinjal",
      "jinjal aadi munji mam o",
      "Ayaladi munji mam o"
    ],
    searchTerms: ["chalde", "rulai", "sajana", "jinjal", "munji"],
    language: "Kutchi", 
    category: "Regional"
  },
  {
    title: "Dakor Na Thakor",
    lyrics: [
      "O Dakor na Thakor",
      "Tara bandh darwaja khol khol khol",
      "He tara dware vaala aavun hun to aavun",
      "O Shyamaliya dholi dhaja ley haravun",
      "Jay Ranchhod makaan chor",
      "Taro galiye galiye shor"
    ],
    searchTerms: ["dakor", "thakor", "darwaja", "khol", "shyamaliya"],
    language: "Gujarati",
    category: "Devotional"
  }
];

// Helper function to get songs by category
export function getSongsByCategory(category: string): Song[] {
  return songsDatabase.filter(song => song.category === category);
}

// Helper function to search songs by title or search terms
export function searchSongs(query: string): Song[] {
  const lowerQuery = query.toLowerCase();
  return songsDatabase.filter(song => 
    song.title.toLowerCase().includes(lowerQuery) ||
    song.searchTerms.some(term => term.toLowerCase().includes(lowerQuery)) ||
    song.lyrics.some(line => line.toLowerCase().includes(lowerQuery))
  );
}

// Helper function to get available categories
export function getCategories(): string[] {
  const categories = new Set(songsDatabase.map(song => song.category || 'Uncategorized'));
  return Array.from(categories).sort();
}

// Helper function to get available languages
export function getLanguages(): string[] {
  const languages = new Set(songsDatabase.map(song => song.language || 'Unknown'));
  return Array.from(languages).sort();
}