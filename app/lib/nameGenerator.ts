/**
 * Generates a random funny Latvian-style player name
 */

const adjectives = [
  // Personality traits
  "Pūkainais",      // Fluffy
  "Miegainais",     // Sleepy
  "Izsalkušais",    // Hungry
  "Aizmāršīgais",   // Forgetful
  "Ziņkārīgais",    // Curious
  "Čaklais",        // Diligent
  "Sapņainais",     // Dreamy
  "Priecīgais",     // Cheerful
  "Kūtrais",        // Lazy
  "Noslēpumainais", // Mysterious
  "Jocīgais",       // Funny
  "Nerātnis",       // Naughty
  "Kautrīgais",     // Shy
  "Negaidītais",    // Unexpected
  "Bezrūpīgais",    // Carefree
  "Neveiklais",     // Clumsy
  "Viltīgais",      // Sly
  "Patstāvīgais",   // Independent
  "Iedomīgais",     // Vain
  "Steidzīgais",    // Hasty
  "Lēnītis",        // Slowpoke
  "Dižais",         // Grand/Mighty
  "Varenais",       // Powerful
  "Smagnējais",     // Heavy
  "Trakulīgais",    // Crazy/Wild

  // Physical traits
  "Apaļais",        // Round
  "Bungainais",     // Chubby
  "Mīkstais",       // Soft
  "Raibais",        // Spotted
  "Spalvainais",    // Hairy/Feathery
  "Strutainais",    // Fluffy/Poofy
  "Zeltainais",     // Golden
  "Trulais",        // Dull/Silly
  "Gludenais",      // Smooth
  "Runcainais",     // Wrinkly
  "Svītrainais",    // Striped
  "Pumpainis",      // Chubby/Plump
  "Pinkainais",     // Tangled
  "Spīdīgais",      // Shiny
  "Matainais",      // Hairy
  "Krāsainais",     // Colorful
  "Mazītiņais",     // Tiny
  "Milzīgais",      // Huge
  "Kupenais",       // Bushy
  "Plakandeguns",   // Flat-nosed
];

const nouns = [
  // Foods - vegetables
  "Kartupelis",   // Potato
  "Gurķis",       // Cucumber
  "Kāposts",      // Cabbage
  "Rācenis",      // Turnip
  "Biete",        // Beet
  "Burkāns",      // Carrot
  "Sīpols",       // Onion
  "Ķiploks",      // Garlic
  "Tomāts",       // Tomato
  "Pupas",        // Beans
  "Redīss",       // Radish
  "Ķirbis",       // Pumpkin
  "Kabacis",      // Zucchini

  // Foods - fruits
  "Bumbieris",    // Pear
  "Ābols",        // Apple
  "Plūme",        // Plum
  "Ķirsis",       // Cherry
  "Zemene",       // Strawberry
  "Avene",        // Raspberry
  "Mellene",      // Blueberry
  "Arbūzs",       // Watermelon
  "Banāns",       // Banana
  "Apelsīns",     // Orange
  "Citrons",      // Lemon

  // Foods - Latvian dishes & baked goods
  "Pankūka",      // Pancake
  "Pelmeņis",     // Dumpling
  "Cepums",       // Cookie
  "Zefīrs",       // Marshmallow
  "Kliņģeris",    // Pretzel
  "Sklandrausis", // Traditional Latvian pie
  "Pirāgs",       // Pastry/Pie
  "Speķītis",     // Little bacon
  "Pīrādziņš",    // Little pastry
  "Desiņa",       // Little sausage
  "Siers",        // Cheese
  "Maizīte",      // Little bread
  "Rupjmaize",    // Rye bread
  "Kotlete",      // Cutlet
  "Šašliks",      // Shashlik
  "Rasols",       // Potato salad
  "Biezpiens",    // Cottage cheese
  "Krējums",      // Sour cream
  "Putra",        // Porridge
  "Zupa",         // Soup
  "Kūka",         // Cake

  // Foods - other
  "Pipars",       // Pepper
  "Sēne",         // Mushroom
  "Rieksts",      // Nut
  "Medus",        // Honey
  "Sāls",         // Salt
  "Cukurs",       // Sugar

  // Animals - cute/funny ones
  "Ezis",         // Hedgehog
  "Zaķis",        // Rabbit
  "Vāveris",      // Squirrel
  "Pele",         // Mouse
  "Krupis",       // Toad
  "Gliemezis",    // Snail
  "Tārps",        // Worm
  "Vabole",       // Beetle
  "Kurmis",       // Mole
  "Āpsis",        // Badger
  "Bebrs",        // Beaver
  "Pīle",         // Duck
  "Zoss",         // Goose
  "Vista",        // Chicken
  "Cūciņa",       // Piglet
  "Kaķēns",       // Kitten
  "Kucēns",       // Puppy
  "Jēriņš",       // Little lamb
  "Pingvīns",     // Penguin
  "Tukāns",       // Toucan

  // Objects - silly
  "Zeķe",         // Sock
  "Poga",         // Button
  "Slota",        // Broom
  "Spainītis",    // Little bucket
  "Puķpods",      // Flower pot
  "Cimdiņš",      // Little glove
  "Spilvens",     // Pillow
  "Sega",         // Blanket
  "Bumba",        // Ball
  "Zvans",        // Bell
];

export function generatePlayerName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective}${noun}${number}`;
}

/**
 * Generates a unique player ID
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
