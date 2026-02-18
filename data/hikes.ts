export interface Hike {
  id: string;
  name: string;
  location: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
  duration: string;
  distance: string;
  bestSeason: string;
  description: string;
  fullDescription: string;
  image: string;
  permitRequired: boolean;
  safetyTips: string[];
  highlights: string[];
  mapEmbedUrl: string;

  baseFee: number;
  dropLat: number;
  dropLng: number;
}

export const hikes: Hike[] = [
  {
    id: "knuckles-5-peaks",
    name: "Knuckles 5 Peaks",
    location: "Knuckles Mountain Range",
    dropLat: 7.442689757753227,
    dropLng: 80.78100376362855,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106463.06543848112!2d80.74688807107592!3d7.414528623514566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae35f659beee899%3A0x3bf7cc23068a888d!2sKnuckles!5e0!3m2!1sen!2slk!4v1770828729587!5m2!1sen!2slk",
    difficulty: "Hard",
    duration: "8-10 hours",
    distance: "14 km",
    bestSeason: "December to April",
    description: "Conquer five majestic peaks in one epic adventure through mist-covered mountains.",
    fullDescription: "The Knuckles 5 Peaks Challenge is one of Sri Lanka's most rewarding yet demanding hikes. This circular route takes you through pristine cloud forests, past cascading waterfalls, and across ridgelines with breathtaking 360-degree views. Each peak offers unique vistas of the surrounding valleys and distant plains. The trail requires good fitness and proper preparation.",
    image: new URL("@/assets/knuckles-peaks.jpg", import.meta.url).href,
    permitRequired: true,
    safetyTips: [
      "Start early (5-6 AM) to avoid afternoon mists",
      "Carry at least 3 liters of water per person",
      "Weather changes rapidly - bring waterproof gear",
      "Hire a local guide - trails can be confusing",
      "Inform someone of your hiking plans",
    ],
    highlights: [
      "Five distinct summit views",
      "Cloud forest ecosystems",
      "Endemic bird species",
      "Traditional villages en route",
      "360-degree panoramic vistas",
    ],
  },
  {
    id: "yahangala",
    name: "Yahangala Mountain",
    location: "Kandy District",
    dropLat: 7.409240676316743,
    dropLng: 80.90546799028637,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15826.032415382579!2d80.89525216577704!3d7.408877510253356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae4a3ddecb39897%3A0xffb7f2988f73fa3e!2sYahangala!5e0!3m2!1sen!2slk!4v1770832358819!5m2!1sen!2slk",
    difficulty: "Expert",
    duration: "5-6 hours",
    distance: "8 km",
    bestSeason: "January to March",
    description: "Experience dramatic cliff faces and stunning vistas from this iconic rocky peak.",
    fullDescription: "Yahangala, meaning 'Rock of the Reclining Buddha', features a distinctive cliff face that dominates the landscape. The hike combines forest trails with scrambling sections near the summit. The reward is an incredible view across multiple mountain ranges and valleys stretching to the horizon.",
    image: new URL("@/assets/yahangala.jpg", import.meta.url).href,
    permitRequired: true,
    safetyTips: [
      "Not suitable for those with fear of heights",
      "Wear good grip hiking shoes",
      "Avoid during monsoon season",
      "Stay on marked trails near cliff edges",
      "Check weather forecast before departure",
    ],
    highlights: [
      "Iconic cliff face views",
      "Sunrise photography spot",
      "Diverse forest ecosystems",
      "Rock scrambling adventure",
      "Mountain range panoramas",
    ],
  },
  {
    id: "kehelpathdoruwa",
    name: "Kehelpathdoruwa Mountain",
    location: "Knuckles Range",
    dropLat: 7.411883126605733,
    dropLng: 80.89229512644647,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13308.10006221013!2d80.88730512176753!3d7.407349815150795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae4a15d49b42d33%3A0x76bf446b4987df31!2sKehelpathdoruwegala!5e0!3m2!1sen!2slk!4v1770832447183!5m2!1sen!2slk",
    difficulty: "Expert",
    duration: "6-7 hours",
    distance: "6 km",
    bestSeason: "Year-round (best Dec-April)",
    description: "Trek through lush jungle paths to reach serene mountain peaks with breathtaking views.",
    fullDescription: "Kehelpathdoruwa offers an accessible yet rewarding mountain experience. The trail winds through dense tropical forest before opening up to grassland ridges. The summit provides panoramic views of the Knuckles Range and surrounding tea estates.",
    image: new URL("@/assets/kehelpathdoruwa.jpg", import.meta.url).href,
    permitRequired: true,
    safetyTips: [
      "Trail can be slippery after rain",
      "Bring insect repellent",
      "Start before 7 AM for best conditions",
      "Local guide recommended for first-timers",
      "Carry basic first aid kit",
    ],
    highlights: [
      "Jungle canopy experience",
      "Tea estate landscapes",
      "Easier than neighboring peaks",
      "Rich biodiversity",
      "Summit grasslands",
    ],
  },
  {
    id: "kabaragala",
    name: "Kabaragala",
    location: "Nawalapitiya",
    dropLat: 7.073494829614234,
    dropLng: 80.50372428382437,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9417.292403533607!2d80.50629977352177!3d7.069778610883049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae37584bcc3576f%3A0x2a7a7e46ea27d578!2sKabaragala%20Peak!5e0!3m2!1sen!2slk!4v1770832885573!5m2!1sen!2slk",
    difficulty: "Easy",
    duration: "3-4 hours",
    distance: "10 km",
    bestSeason: "December to March",
    description: "Summit rocky peaks for unparalleled 360-degree views across Sri Lanka's hill country.",
    fullDescription: "Kabaragala is known for its dramatic rocky summit and spectacular views. The hike passes through pine forests and grasslands before reaching the exposed rocky peak. On clear days, you can see across multiple districts and even spot the distant coastline.",
    image: new URL("@/assets/kabaragala.jpg", import.meta.url).href,
    permitRequired: false,
    safetyTips: [
      "Summit exposed to sun and wind",
      "Bring sun protection and warm layer",
      "Rocky sections require care",
      "Best avoided during high winds",
      "Download offline maps",
    ],
    highlights: [
      "360-degree summit views",
      "Pine forest trails",
      "Dramatic rock formations",
      "Sunset viewing spot",
      "Multiple bird species",
    ],
  },
  {
    id: "garandiella",
    name: "Garandiella Mountain",
    location: "Central Highlands",
    dropLat: 7.38681080597022,
    dropLng: 80.89598338604532,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19940.694933324907!2d80.86561702743191!3d7.383567558898817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae4a1805ad5a80d%3A0x7a221f8222f77cbf!2sKalugala!5e0!3m2!1sen!2slk!4v1770832632000!5m2!1sen!2slk",
    difficulty: "Moderate",
    duration: "4-5 hours",
    distance: "7 km",
    bestSeason: "January to April",
    description: "Watch sunrise paint the mountains gold from this peaceful summit sanctuary.",
    fullDescription: "Garandiella is famous for its sunrise views. The pre-dawn hike leads through quiet forests to a summit that offers one of Sri Lanka's most spectacular sunrise vistas. The peaceful mountain atmosphere makes this a meditative hiking experience.",
    image: new URL("@/assets/garandiella.jpg", import.meta.url).href,
    permitRequired: false,
    safetyTips: [
      "Start hike around 4 AM for sunrise",
      "Bring headlamp with extra batteries",
      "Temperatures cold at summit pre-dawn",
      "Trail well-marked but guide helpful",
      "Arrange transport in advance",
    ],
    highlights: [
      "Spectacular sunrise views",
      "Peaceful mountain atmosphere",
      "Less crowded than major peaks",
      "Mountain silhouettes",
      "Photography opportunities",
    ],
  },

  {
    id: "greatwestern",
    name: "Great Western Mountain",
    location: "Central Highlands",
    dropLat: 6.962338208174792,
    dropLng: 80.69030071752192,
    baseFee: 6500,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31682.325482926728!2d80.69511739999999!3d6.9749903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae382413f5cf14b%3A0xa55560811c29af87!2sGreat%20Western%20Mountain!5e0!3m2!1sen!2slk!4v1770833248544!5m2!1sen!2slk",
    difficulty: "Expert",
    duration: "7-8 hours",
    distance: "14 km",
    bestSeason: "January to April",
    description: "Watch sunrise paint the mountains gold from this peaceful summit sanctuary.",
    fullDescription: "Great Western Mountain is famous for its challenging trails and breathtaking views. The hike leads through dense forests and rocky terrain to a summit that offers one of Sri Lanka's most spectacular vistas. The mountain atmosphere makes this a rewarding hiking experience.",
    image: new URL("@/assets/great_western.jpg", import.meta.url).href,
    permitRequired: false,
    safetyTips: [
      "Start hike around 4 AM for sunrise",
      "Bring headlamp with extra batteries",
      "Temperatures cold at summit pre-dawn",
      "Trail well-marked but guide helpful",
      "Arrange transport in advance",
    ],
    highlights: [
      "Spectacular sunrise views",
      "Peaceful mountain atmosphere",
      "Less crowded than major peaks",
      "Mountain silhouettes",
      "Photography opportunities",
    ],
  },
];


