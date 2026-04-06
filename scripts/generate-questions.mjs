// Generate flags.json and capitals.json from structured data
import { writeFileSync } from 'fs';

// Country data: [alpha2, englishName, germanName, capital_en, capital_de, continent, difficulty]
const countries = [
  // EUROPE
  ['de', 'Germany', 'Deutschland', 'Berlin', 'Berlin', 'europe', 'easy'],
  ['fr', 'France', 'Frankreich', 'Paris', 'Paris', 'europe', 'easy'],
  ['it', 'Italy', 'Italien', 'Rome', 'Rom', 'europe', 'easy'],
  ['es', 'Spain', 'Spanien', 'Madrid', 'Madrid', 'europe', 'easy'],
  ['gb', 'United Kingdom', 'Vereinigtes Königreich', 'London', 'London', 'europe', 'easy'],
  ['pt', 'Portugal', 'Portugal', 'Lisbon', 'Lissabon', 'europe', 'easy'],
  ['nl', 'Netherlands', 'Niederlande', 'Amsterdam', 'Amsterdam', 'europe', 'easy'],
  ['be', 'Belgium', 'Belgien', 'Brussels', 'Brüssel', 'europe', 'easy'],
  ['at', 'Austria', 'Österreich', 'Vienna', 'Wien', 'europe', 'easy'],
  ['ch', 'Switzerland', 'Schweiz', 'Bern', 'Bern', 'europe', 'easy'],
  ['se', 'Sweden', 'Schweden', 'Stockholm', 'Stockholm', 'europe', 'easy'],
  ['no', 'Norway', 'Norwegen', 'Oslo', 'Oslo', 'europe', 'easy'],
  ['dk', 'Denmark', 'Dänemark', 'Copenhagen', 'Kopenhagen', 'europe', 'easy'],
  ['fi', 'Finland', 'Finnland', 'Helsinki', 'Helsinki', 'europe', 'medium'],
  ['ie', 'Ireland', 'Irland', 'Dublin', 'Dublin', 'europe', 'easy'],
  ['pl', 'Poland', 'Polen', 'Warsaw', 'Warschau', 'europe', 'medium'],
  ['cz', 'Czech Republic', 'Tschechien', 'Prague', 'Prag', 'europe', 'medium'],
  ['sk', 'Slovakia', 'Slowakei', 'Bratislava', 'Bratislava', 'europe', 'medium'],
  ['hu', 'Hungary', 'Ungarn', 'Budapest', 'Budapest', 'europe', 'medium'],
  ['ro', 'Romania', 'Rumänien', 'Bucharest', 'Bukarest', 'europe', 'medium'],
  ['bg', 'Bulgaria', 'Bulgarien', 'Sofia', 'Sofia', 'europe', 'medium'],
  ['gr', 'Greece', 'Griechenland', 'Athens', 'Athen', 'europe', 'easy'],
  ['hr', 'Croatia', 'Kroatien', 'Zagreb', 'Zagreb', 'europe', 'medium'],
  ['rs', 'Serbia', 'Serbien', 'Belgrade', 'Belgrad', 'europe', 'medium'],
  ['ba', 'Bosnia and Herzegovina', 'Bosnien und Herzegowina', 'Sarajevo', 'Sarajevo', 'europe', 'medium'],
  ['me', 'Montenegro', 'Montenegro', 'Podgorica', 'Podgorica', 'europe', 'hard'],
  ['mk', 'North Macedonia', 'Nordmazedonien', 'Skopje', 'Skopje', 'europe', 'hard'],
  ['al', 'Albania', 'Albanien', 'Tirana', 'Tirana', 'europe', 'medium'],
  ['si', 'Slovenia', 'Slowenien', 'Ljubljana', 'Ljubljana', 'europe', 'medium'],
  ['lt', 'Lithuania', 'Litauen', 'Vilnius', 'Vilnius', 'europe', 'medium'],
  ['lv', 'Latvia', 'Lettland', 'Riga', 'Riga', 'europe', 'medium'],
  ['ee', 'Estonia', 'Estland', 'Tallinn', 'Tallinn', 'europe', 'medium'],
  ['mt', 'Malta', 'Malta', 'Valletta', 'Valletta', 'europe', 'hard'],
  ['cy', 'Cyprus', 'Zypern', 'Nicosia', 'Nikosia', 'europe', 'medium'],
  ['lu', 'Luxembourg', 'Luxemburg', 'Luxembourg City', 'Luxemburg', 'europe', 'medium'],
  ['is', 'Iceland', 'Island', 'Reykjavik', 'Reykjavik', 'europe', 'medium'],
  ['li', 'Liechtenstein', 'Liechtenstein', 'Vaduz', 'Vaduz', 'europe', 'hard'],
  ['mc', 'Monaco', 'Monaco', 'Monaco', 'Monaco', 'europe', 'hard'],
  ['sm', 'San Marino', 'San Marino', 'San Marino', 'San Marino', 'europe', 'hard'],
  ['ad', 'Andorra', 'Andorra', 'Andorra la Vella', 'Andorra la Vella', 'europe', 'hard'],
  ['ua', 'Ukraine', 'Ukraine', 'Kyiv', 'Kiew', 'europe', 'easy'],
  ['by', 'Belarus', 'Belarus', 'Minsk', 'Minsk', 'europe', 'medium'],
  ['md', 'Moldova', 'Moldau', 'Chișinău', 'Chișinău', 'europe', 'hard'],
  ['xk', 'Kosovo', 'Kosovo', 'Pristina', 'Pristina', 'europe', 'hard'],
  // AFRICA
  ['dz', 'Algeria', 'Algerien', 'Algiers', 'Algier', 'africa', 'medium'],
  ['eg', 'Egypt', 'Ägypten', 'Cairo', 'Kairo', 'africa', 'easy'],
  ['ly', 'Libya', 'Libyen', 'Tripoli', 'Tripolis', 'africa', 'medium'],
  ['tn', 'Tunisia', 'Tunesien', 'Tunis', 'Tunis', 'africa', 'medium'],
  ['ma', 'Morocco', 'Marokko', 'Rabat', 'Rabat', 'africa', 'medium'],
  ['sd', 'Sudan', 'Sudan', 'Khartoum', 'Khartum', 'africa', 'medium'],
  ['ss', 'South Sudan', 'Südsudan', 'Juba', 'Juba', 'africa', 'hard'],
  ['et', 'Ethiopia', 'Äthiopien', 'Addis Ababa', 'Addis Abeba', 'africa', 'medium'],
  ['er', 'Eritrea', 'Eritrea', 'Asmara', 'Asmara', 'africa', 'hard'],
  ['dj', 'Djibouti', 'Dschibuti', 'Djibouti', 'Dschibuti', 'africa', 'hard'],
  ['so', 'Somalia', 'Somalia', 'Mogadishu', 'Mogadischu', 'africa', 'hard'],
  ['ke', 'Kenya', 'Kenia', 'Nairobi', 'Nairobi', 'africa', 'easy'],
  ['tz', 'Tanzania', 'Tansania', 'Dodoma', 'Dodoma', 'africa', 'medium'],
  ['ug', 'Uganda', 'Uganda', 'Kampala', 'Kampala', 'africa', 'medium'],
  ['rw', 'Rwanda', 'Ruanda', 'Kigali', 'Kigali', 'africa', 'hard'],
  ['bi', 'Burundi', 'Burundi', 'Gitega', 'Gitega', 'africa', 'hard'],
  ['cd', 'DR Congo', 'Demokratische Republik Kongo', 'Kinshasa', 'Kinshasa', 'africa', 'medium'],
  ['cg', 'Republic of the Congo', 'Republik Kongo', 'Brazzaville', 'Brazzaville', 'africa', 'hard'],
  ['cf', 'Central African Republic', 'Zentralafrikanische Republik', 'Bangui', 'Bangui', 'africa', 'hard'],
  ['cm', 'Cameroon', 'Kamerun', 'Yaoundé', 'Yaoundé', 'africa', 'medium'],
  ['ng', 'Nigeria', 'Nigeria', 'Abuja', 'Abuja', 'africa', 'medium'],
  ['ne', 'Niger', 'Niger', 'Niamey', 'Niamey', 'africa', 'hard'],
  ['td', 'Chad', 'Tschad', 'N\'Djamena', 'N\'Djamena', 'africa', 'hard'],
  ['gh', 'Ghana', 'Ghana', 'Accra', 'Accra', 'africa', 'medium'],
  ['ci', 'Ivory Coast', 'Elfenbeinküste', 'Yamoussoukro', 'Yamoussoukro', 'africa', 'hard'],
  ['sn', 'Senegal', 'Senegal', 'Dakar', 'Dakar', 'africa', 'medium'],
  ['ml', 'Mali', 'Mali', 'Bamako', 'Bamako', 'africa', 'hard'],
  ['bf', 'Burkina Faso', 'Burkina Faso', 'Ouagadougou', 'Ouagadougou', 'africa', 'hard'],
  ['gn', 'Guinea', 'Guinea', 'Conakry', 'Conakry', 'africa', 'hard'],
  ['gm', 'Gambia', 'Gambia', 'Banjul', 'Banjul', 'africa', 'hard'],
  ['sl', 'Sierra Leone', 'Sierra Leone', 'Freetown', 'Freetown', 'africa', 'hard'],
  ['lr', 'Liberia', 'Liberia', 'Monrovia', 'Monrovia', 'africa', 'hard'],
  ['tg', 'Togo', 'Togo', 'Lomé', 'Lomé', 'africa', 'hard'],
  ['bj', 'Benin', 'Benin', 'Porto-Novo', 'Porto-Novo', 'africa', 'hard'],
  ['mz', 'Mozambique', 'Mosambik', 'Maputo', 'Maputo', 'africa', 'hard'],
  ['mg', 'Madagascar', 'Madagaskar', 'Antananarivo', 'Antananarivo', 'africa', 'hard'],
  ['mw', 'Malawi', 'Malawi', 'Lilongwe', 'Lilongwe', 'africa', 'hard'],
  ['zm', 'Zambia', 'Sambia', 'Lusaka', 'Lusaka', 'africa', 'hard'],
  ['zw', 'Zimbabwe', 'Simbabwe', 'Harare', 'Harare', 'africa', 'medium'],
  ['bw', 'Botswana', 'Botswana', 'Gaborone', 'Gaborone', 'africa', 'hard'],
  ['na', 'Namibia', 'Namibia', 'Windhoek', 'Windhoek', 'africa', 'medium'],
  ['za', 'South Africa', 'Südafrika', 'Pretoria', 'Pretoria', 'africa', 'easy'],
  ['sz', 'Eswatini', 'Eswatini', 'Mbabane', 'Mbabane', 'africa', 'hard'],
  ['ls', 'Lesotho', 'Lesotho', 'Maseru', 'Maseru', 'africa', 'hard'],
  ['ao', 'Angola', 'Angola', 'Luanda', 'Luanda', 'africa', 'medium'],
  ['ga', 'Gabon', 'Gabun', 'Libreville', 'Libreville', 'africa', 'hard'],
  ['gq', 'Equatorial Guinea', 'Äquatorialguinea', 'Malabo', 'Malabo', 'africa', 'hard'],
  ['st', 'São Tomé and Príncipe', 'São Tomé und Príncipe', 'São Tomé', 'São Tomé', 'africa', 'hard'],
  ['cv', 'Cape Verde', 'Kap Verde', 'Praia', 'Praia', 'africa', 'hard'],
  ['mr', 'Mauritania', 'Mauretanien', 'Nouakchott', 'Nouakchott', 'africa', 'hard'],
  ['km', 'Comoros', 'Komoren', 'Moroni', 'Moroni', 'africa', 'hard'],
  ['mu', 'Mauritius', 'Mauritius', 'Port Louis', 'Port Louis', 'africa', 'hard'],
  ['sc', 'Seychelles', 'Seychellen', 'Victoria', 'Victoria', 'africa', 'hard'],
  // ASIA
  ['cn', 'China', 'China', 'Beijing', 'Peking', 'asia', 'easy'],
  ['jp', 'Japan', 'Japan', 'Tokyo', 'Tokio', 'asia', 'easy'],
  ['kr', 'South Korea', 'Südkorea', 'Seoul', 'Seoul', 'asia', 'easy'],
  ['kp', 'North Korea', 'Nordkorea', 'Pyongyang', 'Pjöngjang', 'asia', 'medium'],
  ['mn', 'Mongolia', 'Mongolei', 'Ulaanbaatar', 'Ulaanbaatar', 'asia', 'hard'],
  ['in', 'India', 'Indien', 'New Delhi', 'Neu-Delhi', 'asia', 'easy'],
  ['pk', 'Pakistan', 'Pakistan', 'Islamabad', 'Islamabad', 'asia', 'medium'],
  ['bd', 'Bangladesh', 'Bangladesch', 'Dhaka', 'Dhaka', 'asia', 'medium'],
  ['lk', 'Sri Lanka', 'Sri Lanka', 'Sri Jayawardenepura Kotte', 'Sri Jayawardenepura Kotte', 'asia', 'hard'],
  ['np', 'Nepal', 'Nepal', 'Kathmandu', 'Kathmandu', 'asia', 'medium'],
  ['bt', 'Bhutan', 'Bhutan', 'Thimphu', 'Thimphu', 'asia', 'hard'],
  ['mm', 'Myanmar', 'Myanmar', 'Naypyidaw', 'Naypyidaw', 'asia', 'hard'],
  ['th', 'Thailand', 'Thailand', 'Bangkok', 'Bangkok', 'asia', 'easy'],
  ['la', 'Laos', 'Laos', 'Vientiane', 'Vientiane', 'asia', 'hard'],
  ['kh', 'Cambodia', 'Kambodscha', 'Phnom Penh', 'Phnom Penh', 'asia', 'medium'],
  ['vn', 'Vietnam', 'Vietnam', 'Hanoi', 'Hanoi', 'asia', 'medium'],
  ['my', 'Malaysia', 'Malaysia', 'Kuala Lumpur', 'Kuala Lumpur', 'asia', 'medium'],
  ['sg', 'Singapore', 'Singapur', 'Singapore', 'Singapur', 'asia', 'easy'],
  ['id', 'Indonesia', 'Indonesien', 'Jakarta', 'Jakarta', 'asia', 'medium'],
  ['ph', 'Philippines', 'Philippinen', 'Manila', 'Manila', 'asia', 'medium'],
  ['tw', 'Taiwan', 'Taiwan', 'Taipei', 'Taipeh', 'asia', 'medium'],
  ['kz', 'Kazakhstan', 'Kasachstan', 'Astana', 'Astana', 'asia', 'medium'],
  ['uz', 'Uzbekistan', 'Usbekistan', 'Tashkent', 'Taschkent', 'asia', 'hard'],
  ['tm', 'Turkmenistan', 'Turkmenistan', 'Ashgabat', 'Aschgabat', 'asia', 'hard'],
  ['kg', 'Kyrgyzstan', 'Kirgisistan', 'Bishkek', 'Bischkek', 'asia', 'hard'],
  ['tj', 'Tajikistan', 'Tadschikistan', 'Dushanbe', 'Duschanbe', 'asia', 'hard'],
  ['az', 'Azerbaijan', 'Aserbaidschan', 'Baku', 'Baku', 'asia', 'medium'],
  ['ge', 'Georgia', 'Georgien', 'Tbilisi', 'Tiflis', 'asia', 'medium'],
  ['am', 'Armenia', 'Armenien', 'Yerevan', 'Jerewan', 'asia', 'medium'],
  ['tr', 'Turkey', 'Türkei', 'Ankara', 'Ankara', 'asia', 'easy'],
  ['iq', 'Iraq', 'Irak', 'Baghdad', 'Bagdad', 'asia', 'medium'],
  ['ir', 'Iran', 'Iran', 'Tehran', 'Teheran', 'asia', 'medium'],
  ['sy', 'Syria', 'Syrien', 'Damascus', 'Damaskus', 'asia', 'medium'],
  ['jo', 'Jordan', 'Jordanien', 'Amman', 'Amman', 'asia', 'medium'],
  ['lb', 'Lebanon', 'Libanon', 'Beirut', 'Beirut', 'asia', 'medium'],
  ['il', 'Israel', 'Israel', 'Jerusalem', 'Jerusalem', 'asia', 'easy'],
  ['ps', 'Palestine', 'Palästina', 'Ramallah', 'Ramallah', 'asia', 'hard'],
  ['sa', 'Saudi Arabia', 'Saudi-Arabien', 'Riyadh', 'Riad', 'asia', 'medium'],
  ['ye', 'Yemen', 'Jemen', 'Sana\'a', 'Sanaa', 'asia', 'hard'],
  ['om', 'Oman', 'Oman', 'Muscat', 'Maskat', 'asia', 'hard'],
  ['ae', 'United Arab Emirates', 'Vereinigte Arabische Emirate', 'Abu Dhabi', 'Abu Dhabi', 'asia', 'medium'],
  ['qa', 'Qatar', 'Katar', 'Doha', 'Doha', 'asia', 'medium'],
  ['bh', 'Bahrain', 'Bahrain', 'Manama', 'Manama', 'asia', 'hard'],
  ['kw', 'Kuwait', 'Kuwait', 'Kuwait City', 'Kuwait-Stadt', 'asia', 'medium'],
  ['af', 'Afghanistan', 'Afghanistan', 'Kabul', 'Kabul', 'asia', 'medium'],
  ['mv', 'Maldives', 'Malediven', 'Malé', 'Malé', 'asia', 'hard'],
  ['tl', 'East Timor', 'Osttimor', 'Dili', 'Dili', 'asia', 'hard'],
  ['bn', 'Brunei', 'Brunei', 'Bandar Seri Begawan', 'Bandar Seri Begawan', 'asia', 'hard'],
  // AMERICAS
  ['us', 'United States', 'Vereinigte Staaten', 'Washington, D.C.', 'Washington, D.C.', 'americas', 'easy'],
  ['ca', 'Canada', 'Kanada', 'Ottawa', 'Ottawa', 'americas', 'easy'],
  ['mx', 'Mexico', 'Mexiko', 'Mexico City', 'Mexiko-Stadt', 'americas', 'easy'],
  ['gt', 'Guatemala', 'Guatemala', 'Guatemala City', 'Guatemala-Stadt', 'americas', 'medium'],
  ['bz', 'Belize', 'Belize', 'Belmopan', 'Belmopan', 'americas', 'hard'],
  ['hn', 'Honduras', 'Honduras', 'Tegucigalpa', 'Tegucigalpa', 'americas', 'hard'],
  ['sv', 'El Salvador', 'El Salvador', 'San Salvador', 'San Salvador', 'americas', 'medium'],
  ['ni', 'Nicaragua', 'Nicaragua', 'Managua', 'Managua', 'americas', 'medium'],
  ['cr', 'Costa Rica', 'Costa Rica', 'San José', 'San José', 'americas', 'medium'],
  ['pa', 'Panama', 'Panama', 'Panama City', 'Panama-Stadt', 'americas', 'medium'],
  ['cu', 'Cuba', 'Kuba', 'Havana', 'Havanna', 'americas', 'easy'],
  ['jm', 'Jamaica', 'Jamaika', 'Kingston', 'Kingston', 'americas', 'medium'],
  ['ht', 'Haiti', 'Haiti', 'Port-au-Prince', 'Port-au-Prince', 'americas', 'medium'],
  ['do', 'Dominican Republic', 'Dominikanische Republik', 'Santo Domingo', 'Santo Domingo', 'americas', 'medium'],
  ['tt', 'Trinidad and Tobago', 'Trinidad und Tobago', 'Port of Spain', 'Port of Spain', 'americas', 'hard'],
  ['bs', 'Bahamas', 'Bahamas', 'Nassau', 'Nassau', 'americas', 'hard'],
  ['bb', 'Barbados', 'Barbados', 'Bridgetown', 'Bridgetown', 'americas', 'hard'],
  ['ag', 'Antigua and Barbuda', 'Antigua und Barbuda', 'St. John\'s', 'St. John\'s', 'americas', 'hard'],
  ['dm', 'Dominica', 'Dominica', 'Roseau', 'Roseau', 'americas', 'hard'],
  ['gd', 'Grenada', 'Grenada', 'St. George\'s', 'St. George\'s', 'americas', 'hard'],
  ['kn', 'Saint Kitts and Nevis', 'St. Kitts und Nevis', 'Basseterre', 'Basseterre', 'americas', 'hard'],
  ['lc', 'Saint Lucia', 'St. Lucia', 'Castries', 'Castries', 'americas', 'hard'],
  ['vc', 'Saint Vincent', 'St. Vincent', 'Kingstown', 'Kingstown', 'americas', 'hard'],
  ['co', 'Colombia', 'Kolumbien', 'Bogotá', 'Bogotá', 'americas', 'medium'],
  ['ve', 'Venezuela', 'Venezuela', 'Caracas', 'Caracas', 'americas', 'medium'],
  ['gy', 'Guyana', 'Guyana', 'Georgetown', 'Georgetown', 'americas', 'hard'],
  ['sr', 'Suriname', 'Suriname', 'Paramaribo', 'Paramaribo', 'americas', 'hard'],
  ['ec', 'Ecuador', 'Ecuador', 'Quito', 'Quito', 'americas', 'medium'],
  ['pe', 'Peru', 'Peru', 'Lima', 'Lima', 'americas', 'easy'],
  ['br', 'Brazil', 'Brasilien', 'Brasília', 'Brasília', 'americas', 'easy'],
  ['bo', 'Bolivia', 'Bolivien', 'Sucre', 'Sucre', 'americas', 'hard'],
  ['py', 'Paraguay', 'Paraguay', 'Asunción', 'Asunción', 'americas', 'hard'],
  ['uy', 'Uruguay', 'Uruguay', 'Montevideo', 'Montevideo', 'americas', 'medium'],
  ['ar', 'Argentina', 'Argentinien', 'Buenos Aires', 'Buenos Aires', 'americas', 'easy'],
  ['cl', 'Chile', 'Chile', 'Santiago', 'Santiago', 'americas', 'medium'],
  // OCEANIA
  ['au', 'Australia', 'Australien', 'Canberra', 'Canberra', 'oceania', 'easy'],
  ['nz', 'New Zealand', 'Neuseeland', 'Wellington', 'Wellington', 'oceania', 'easy'],
  ['fj', 'Fiji', 'Fidschi', 'Suva', 'Suva', 'oceania', 'hard'],
  ['pg', 'Papua New Guinea', 'Papua-Neuguinea', 'Port Moresby', 'Port Moresby', 'oceania', 'hard'],
  ['ws', 'Samoa', 'Samoa', 'Apia', 'Apia', 'oceania', 'hard'],
  ['to', 'Tonga', 'Tonga', 'Nuku\'alofa', 'Nuku\'alofa', 'oceania', 'hard'],
  ['vu', 'Vanuatu', 'Vanuatu', 'Port Vila', 'Port Vila', 'oceania', 'hard'],
  ['sb', 'Solomon Islands', 'Salomonen', 'Honiara', 'Honiara', 'oceania', 'hard'],
  ['ki', 'Kiribati', 'Kiribati', 'Tarawa', 'Tarawa', 'oceania', 'hard'],
  ['tv', 'Tuvalu', 'Tuvalu', 'Funafuti', 'Funafuti', 'oceania', 'hard'],
  ['fm', 'Micronesia', 'Mikronesien', 'Palikir', 'Palikir', 'oceania', 'hard'],
  ['mh', 'Marshall Islands', 'Marshallinseln', 'Majuro', 'Majuro', 'oceania', 'hard'],
  ['pw', 'Palau', 'Palau', 'Ngerulmud', 'Ngerulmud', 'oceania', 'hard'],
  ['nr', 'Nauru', 'Nauru', 'Yaren', 'Yaren', 'oceania', 'hard'],
];

// Group countries by continent for generating distractors
const byContinent = {};
for (const c of countries) {
  const cont = c[5];
  if (!byContinent[cont]) byContinent[cont] = [];
  byContinent[cont].push(c);
}

function getDistractors(country, allSameContinent, count = 3) {
  const others = allSameContinent.filter(c => c[0] !== country[0]);
  // Shuffle
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

// Generate flags.json
const flagQuestions = [];
let flagIdx = 1;
for (const c of countries) {
  const [code, nameEn, nameDe, , , continent, difficulty] = c;
  const sameContinent = byContinent[continent];
  const distractors = getDistractors(c, sameContinent);

  // Place correct answer at varying positions
  const correctIdx = (flagIdx - 1) % 4;
  const options = [...distractors.map(d => ({ de: d[2], en: d[1] }))];
  options.splice(correctIdx, 0, { de: nameDe, en: nameEn });

  flagQuestions.push({
    id: `flag-${String(flagIdx).padStart(3, '0')}`,
    category: 'flags',
    difficulty,
    type: 'flag',
    flagCode: code,
    continent,
    question: { de: 'Welches Land hat diese Flagge?', en: 'Which country has this flag?' },
    options,
    correctIndex: correctIdx,
    sourceUrl: `https://en.wikipedia.org/wiki/Flag_of_${nameEn.replace(/ /g, '_')}`,
    sourceLabel: 'Wikipedia',
  });
  flagIdx++;
}

writeFileSync('src/assets/data/flags.json', JSON.stringify({
  category: 'flags',
  questions: flagQuestions,
  timelineEvents: [],
}, null, 2));
console.log(`Generated flags.json with ${flagQuestions.length} questions`);

// Generate capitals.json
const capitalQuestions = [];
let capIdx = 1;

// Helper: get other cities for distractors (mix of capitals + non-capitals from region)
const majorCities = {
  europe: ['München', 'Hamburg', 'Lyon', 'Marseille', 'Barcelona', 'Mailand', 'Rotterdam', 'Antwerpen', 'Graz', 'Zürich', 'Göteborg', 'Bergen', 'Aarhus', 'Tampere', 'Cork', 'Krakau', 'Brno', 'Debrecen', 'Cluj', 'Thessaloniki', 'Split', 'Novi Sad', 'Porto', 'Genf', 'Malmö'],
  africa: ['Alexandria', 'Casablanca', 'Lagos', 'Mombasa', 'Daressalam', 'Kapstadt', 'Durban', 'Fes', 'Oran', 'Bengasi', 'Sfax', 'Mombasa', 'Arusha', 'Meknes', 'Tanger', 'Kumasi', 'Port Harcourt', 'Ibadan', 'Dar es Salaam', 'Lusaka'],
  asia: ['Shanghai', 'Osaka', 'Mumbai', 'Karatschi', 'Lahore', 'Kalkutta', 'Chennai', 'Busan', 'Hongkong', 'Guangzhou', 'Chengdu', 'Xi\'an', 'Shenzhen', 'Yokohama', 'Jeddah', 'Isfahan', 'Basra', 'Aleppo', 'Ho-Chi-Minh-Stadt', 'Surabaya'],
  americas: ['New York', 'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Guadalajara', 'São Paulo', 'Rio de Janeiro', 'Medellín', 'Maracaibo', 'Guayaquil', 'Córdoba', 'Valparaíso', 'Salvador', 'Recife', 'Monterrey', 'Montreal', 'Miami', 'Houston', 'Seattle'],
  oceania: ['Sydney', 'Melbourne', 'Auckland', 'Brisbane', 'Perth', 'Adelaide', 'Christchurch', 'Gold Coast', 'Hobart', 'Darwin'],
};

const majorCitiesEn = {
  europe: ['Munich', 'Hamburg', 'Lyon', 'Marseille', 'Barcelona', 'Milan', 'Rotterdam', 'Antwerp', 'Graz', 'Zurich', 'Gothenburg', 'Bergen', 'Aarhus', 'Tampere', 'Cork', 'Krakow', 'Brno', 'Debrecen', 'Cluj', 'Thessaloniki', 'Split', 'Novi Sad', 'Porto', 'Geneva', 'Malmö'],
  africa: ['Alexandria', 'Casablanca', 'Lagos', 'Mombasa', 'Dar es Salaam', 'Cape Town', 'Durban', 'Fez', 'Oran', 'Benghazi', 'Sfax', 'Mombasa', 'Arusha', 'Meknes', 'Tangier', 'Kumasi', 'Port Harcourt', 'Ibadan', 'Dar es Salaam', 'Lusaka'],
  asia: ['Shanghai', 'Osaka', 'Mumbai', 'Karachi', 'Lahore', 'Kolkata', 'Chennai', 'Busan', 'Hong Kong', 'Guangzhou', 'Chengdu', 'Xi\'an', 'Shenzhen', 'Yokohama', 'Jeddah', 'Isfahan', 'Basra', 'Aleppo', 'Ho Chi Minh City', 'Surabaya'],
  americas: ['New York', 'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Guadalajara', 'São Paulo', 'Rio de Janeiro', 'Medellín', 'Maracaibo', 'Guayaquil', 'Córdoba', 'Valparaíso', 'Salvador', 'Recife', 'Monterrey', 'Montreal', 'Miami', 'Houston', 'Seattle'],
  oceania: ['Sydney', 'Melbourne', 'Auckland', 'Brisbane', 'Perth', 'Adelaide', 'Christchurch', 'Gold Coast', 'Hobart', 'Darwin'],
};

for (const c of countries) {
  const [code, nameEn, nameDe, capitalEn, capitalDe, continent, difficulty] = c;
  const sameContinent = byContinent[continent];

  // Get 3 distractors: mix of other capitals and major cities
  const otherCapitals = sameContinent
    .filter(x => x[0] !== code)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const cityPool = majorCities[continent] || [];
  const cityPoolEn = majorCitiesEn[continent] || [];
  const cityIdx = Math.floor(Math.random() * cityPool.length);
  const selectedCity = cityPool[cityIdx] || sameContinent[0]?.[3] || 'Unknown';
  const selectedCityEn = cityPoolEn[cityIdx] || sameContinent[0]?.[4] || 'Unknown';

  const distractorOptions = [
    ...otherCapitals.map(d => ({ de: d[4], en: d[3] })),
    { de: selectedCity, en: selectedCityEn },
  ].slice(0, 3);

  const correctIdx = (capIdx - 1) % 4;
  const options = [...distractorOptions];
  options.splice(correctIdx, 0, { de: capitalDe, en: capitalEn });

  capitalQuestions.push({
    id: `cap-${String(capIdx).padStart(3, '0')}`,
    category: 'capitals',
    difficulty,
    continent,
    question: {
      de: `Was ist die Hauptstadt von ${nameDe}?`,
      en: `What is the capital of ${nameEn}?`,
    },
    options,
    correctIndex: correctIdx,
    sourceUrl: `https://en.wikipedia.org/wiki/${capitalEn.replace(/ /g, '_')}`,
    sourceLabel: 'Wikipedia',
  });
  capIdx++;
}

writeFileSync('src/assets/data/capitals.json', JSON.stringify({
  category: 'capitals',
  questions: capitalQuestions,
  timelineEvents: [],
}, null, 2));
console.log(`Generated capitals.json with ${capitalQuestions.length} questions`);
