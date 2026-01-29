export interface Movie {
  id: number;
  title: string;
  tags: string;
  genres: string[];
  overview: string;
  poster_path?: string;
}

// Sample movie data (simulating the pickle file content)
export const movies: Movie[] = [
  { id: 19995, title: "Avatar", tags: "action adventure fantasy science fiction alien world future", genres: ["Action", "Adventure", "Fantasy"], overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission." },
  { id: 285, title: "Pirates of the Caribbean: At World's End", tags: "adventure fantasy action pirate ship ocean", genres: ["Adventure", "Fantasy", "Action"], overview: "Captain Barbossa, Will Turner and Elizabeth Swann must sail off to the world's end." },
  { id: 206647, title: "Spectre", tags: "action adventure crime spy james bond", genres: ["Action", "Adventure", "Crime"], overview: "A cryptic message from Bond's past sends him on a trail to uncover a sinister organization." },
  { id: 49026, title: "The Dark Knight Rises", tags: "action crime drama thriller batman superhero", genres: ["Action", "Crime", "Drama"], overview: "Eight years after the Joker's reign of anarchy, Batman must return to defend Gotham City." },
  { id: 49529, title: "John Carter", tags: "action adventure science fiction mars alien", genres: ["Action", "Adventure", "Sci-Fi"], overview: "John Carter is transported to Mars where he discovers a diverse planet." },
  { id: 559, title: "Spider-Man 3", tags: "fantasy action superhero marvel", genres: ["Fantasy", "Action"], overview: "The seemingly invincible Spider-Man goes up against an all-new crop of villains." },
  { id: 38757, title: "Tangled", tags: "animation comedy family fantasy disney princess", genres: ["Animation", "Comedy", "Family"], overview: "When the kingdom's most wanted bandit is taken hostage by a beautiful girl." },
  { id: 99861, title: "Avengers: Age of Ultron", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "When Tony Stark tries to jumpstart a dormant peacekeeping program, things go awry." },
  { id: 767, title: "Harry Potter and the Half-Blood Prince", tags: "adventure fantasy family magic wizard", genres: ["Adventure", "Fantasy", "Family"], overview: "As Harry begins his sixth year at Hogwarts, he discovers an old book." },
  { id: 209112, title: "Batman v Superman: Dawn of Justice", tags: "action adventure fantasy superhero dc", genres: ["Action", "Adventure", "Fantasy"], overview: "Fearing that Superman's actions are left unchecked, Batman takes on the Man of Steel." },
  { id: 24428, title: "The Avengers", tags: "science fiction action adventure superhero marvel", genres: ["Sci-Fi", "Action", "Adventure"], overview: "When an unexpected enemy emerges and threatens global safety, Nick Fury calls together The Avengers." },
  { id: 1865, title: "Pirates of the Caribbean: On Stranger Tides", tags: "adventure action fantasy pirate ocean", genres: ["Adventure", "Action", "Fantasy"], overview: "Captain Jack Sparrow crosses paths with a woman from his past." },
  { id: 76338, title: "Thor: The Dark World", tags: "action adventure fantasy superhero marvel", genres: ["Action", "Adventure", "Fantasy"], overview: "Thor battles an ancient race of Dark Elves led by the vengeful Malekith." },
  { id: 68721, title: "Iron Man 3", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin." },
  { id: 10138, title: "Iron Man 2", tags: "adventure action science fiction superhero marvel", genres: ["Adventure", "Action", "Sci-Fi"], overview: "With the world now aware that he is Iron Man, billionaire inventor Tony Stark faces pressure." },
  { id: 12445, title: "Harry Potter and the Deathly Hallows: Part 2", tags: "adventure fantasy family magic wizard", genres: ["Adventure", "Fantasy", "Family"], overview: "Harry, Ron, and Hermione continue their quest to find and destroy Voldemort's Horcruxes." },
  { id: 22, title: "Pirates of the Caribbean: Dead Man's Chest", tags: "adventure fantasy action pirate ship", genres: ["Adventure", "Fantasy", "Action"], overview: "Captain Jack Sparrow works his way out of a blood debt with the legendary Davy Jones." },
  { id: 1893, title: "Star Wars: Episode I - The Phantom Menace", tags: "adventure action science fiction space", genres: ["Adventure", "Action", "Sci-Fi"], overview: "Jedi Knights Qui-Gon Jinn and Obi-Wan Kenobi rescue Queen Padmé Amidala." },
  { id: 77, title: "Memento", tags: "mystery thriller drama memory", genres: ["Mystery", "Thriller"], overview: "A man with short-term memory loss attempts to track down his wife's murderer." },
  { id: 550, title: "Fight Club", tags: "drama thriller underground", genres: ["Drama", "Thriller"], overview: "An insomniac office worker forms an underground fight club with a soap salesman." },
  { id: 680, title: "Pulp Fiction", tags: "thriller crime drama quentin tarantino", genres: ["Thriller", "Crime"], overview: "The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence." },
  { id: 13, title: "Forrest Gump", tags: "comedy drama romance heartwarming", genres: ["Comedy", "Drama", "Romance"], overview: "A man with a low IQ has accomplished great things in his life." },
  { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", tags: "adventure fantasy action epic", genres: ["Adventure", "Fantasy", "Action"], overview: "A young hobbit, Frodo, finds himself in possession of a powerful ring." },
  { id: 121, title: "The Lord of the Rings: The Two Towers", tags: "adventure fantasy action epic", genres: ["Adventure", "Fantasy", "Action"], overview: "Frodo and Sam continue their journey to destroy the One Ring." },
  { id: 122, title: "The Lord of the Rings: The Return of the King", tags: "adventure fantasy action epic", genres: ["Adventure", "Fantasy", "Action"], overview: "Gandalf and Aragorn lead the World of Men against Sauron's army." },
  { id: 157336, title: "Interstellar", tags: "adventure drama science fiction space time", genres: ["Adventure", "Drama", "Sci-Fi"], overview: "A team of explorers travel through a wormhole in space in an attempt to save humanity." },
  { id: 27205, title: "Inception", tags: "action science fiction adventure thriller dream", genres: ["Action", "Sci-Fi", "Adventure"], overview: "A skilled thief is offered a chance to have his criminal record erased." },
  { id: 155, title: "The Dark Knight", tags: "drama action crime thriller batman superhero", genres: ["Drama", "Action", "Crime"], overview: "Batman raises the stakes in his war on crime." },
  { id: 278, title: "The Shawshank Redemption", tags: "drama crime prison hope", genres: ["Drama", "Crime"], overview: "Two imprisoned men bond over a number of years." },
  { id: 238, title: "The Godfather", tags: "drama crime mafia family", genres: ["Drama", "Crime"], overview: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." },
  { id: 424, title: "Schindler's List", tags: "drama history war holocaust", genres: ["Drama", "History", "War"], overview: "The true story of how businessman Oskar Schindler saved over a thousand Jews." },
  { id: 629, title: "The Usual Suspects", tags: "drama thriller crime mystery", genres: ["Drama", "Thriller", "Crime"], overview: "A sole survivor tells the twisting tale of a group of criminals." },
  { id: 807, title: "Se7en", tags: "crime mystery thriller dark", genres: ["Crime", "Mystery", "Thriller"], overview: "Two detectives hunt a killer who uses the seven deadly sins as motives." },
  { id: 497, title: "The Green Mile", tags: "fantasy drama crime prison supernatural", genres: ["Fantasy", "Drama", "Crime"], overview: "The lives of guards on Death Row are affected by a new inmate." },
  { id: 311, title: "Once Upon a Time in America", tags: "drama crime gangster history", genres: ["Drama", "Crime"], overview: "A former Prohibition-era Jewish gangster returns to the Lower East Side." },
  { id: 598, title: "City of God", tags: "drama crime violence brazil", genres: ["Drama", "Crime"], overview: "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer." },
  { id: 857, title: "Saving Private Ryan", tags: "drama war history wwii", genres: ["Drama", "War", "History"], overview: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines." },
  { id: 769, title: "GoodFellas", tags: "drama crime mafia gangster", genres: ["Drama", "Crime"], overview: "The story of Henry Hill and his life in the mob." },
  { id: 429, title: "The Good, the Bad and the Ugly", tags: "western adventure drama action", genres: ["Western", "Adventure"], overview: "A bounty hunting scam joins two men in an uneasy alliance." },
  { id: 240, title: "The Godfather Part II", tags: "drama crime mafia family sequel", genres: ["Drama", "Crime"], overview: "The early life of Vito Corleone is explored alongside Michael's continuing reign." },
  { id: 510, title: "One Flew Over the Cuckoo's Nest", tags: "drama asylum rebellion", genres: ["Drama"], overview: "A criminal pleads insanity and is admitted to a mental institution." },
  { id: 111, title: "Scarface", tags: "drama crime thriller action", genres: ["Drama", "Crime", "Thriller"], overview: "A Cuban immigrant rises to power as a drug lord in Miami." },
  { id: 103, title: "Taxi Driver", tags: "drama crime thriller", genres: ["Drama", "Crime"], overview: "A mentally unstable veteran works as a nighttime taxi driver in New York City." },
  { id: 274, title: "The Silence of the Lambs", tags: "crime drama thriller horror", genres: ["Crime", "Drama", "Thriller"], overview: "An FBI trainee seeks the help of an imprisoned cannibal to catch a serial killer." },
  { id: 272, title: "Batman Begins", tags: "action crime drama superhero", genres: ["Action", "Crime", "Drama"], overview: "Bruce Wayne trains with the League of Shadows to become Batman." },
  { id: 11, title: "Star Wars", tags: "adventure action science fiction space", genres: ["Adventure", "Action", "Sci-Fi"], overview: "Princess Leia is captured and held hostage by the evil Darth Vader." },
  { id: 1891, title: "The Empire Strikes Back", tags: "adventure action science fiction space", genres: ["Adventure", "Action", "Sci-Fi"], overview: "Luke Skywalker begins Jedi training with Yoda while his friends are pursued by Vader." },
  { id: 1892, title: "Return of the Jedi", tags: "adventure action science fiction space", genres: ["Adventure", "Action", "Sci-Fi"], overview: "Luke Skywalker battles Jabba the Hutt and Darth Vader to save his friends." },
  { id: 603, title: "The Matrix", tags: "action science fiction thriller hacker", genres: ["Action", "Sci-Fi"], overview: "A computer hacker learns the truth about his reality and his role in the war." },
  { id: 604, title: "The Matrix Reloaded", tags: "action science fiction thriller", genres: ["Action", "Sci-Fi"], overview: "Neo and the rebels race against time before the machines discover Zion." },
  { id: 605, title: "The Matrix Revolutions", tags: "action science fiction thriller", genres: ["Action", "Sci-Fi"], overview: "The human city of Zion defends against the massive Machine army." },
  { id: 578, title: "Jaws", tags: "horror thriller shark ocean", genres: ["Horror", "Thriller"], overview: "A giant great white shark arrives on the shores of a New England beach resort." },
  { id: 694, title: "The Shining", tags: "horror thriller psychological", genres: ["Horror", "Thriller"], overview: "A family heads to an isolated hotel where an evil presence influences the father." },
  { id: 185, title: "A Clockwork Orange", tags: "science fiction drama crime dystopia", genres: ["Sci-Fi", "Drama"], overview: "A sadistic gang leader is imprisoned and volunteers for a conduct-aversion experiment." },
  { id: 73, title: "American History X", tags: "drama crime", genres: ["Drama", "Crime"], overview: "A former neo-nazi skinhead tries to prevent his younger brother from going down the same path." },
  { id: 389, title: "12 Angry Men", tags: "drama crime", genres: ["Drama", "Crime"], overview: "A dissenting juror in a murder trial slowly manages to convince the others." },
  { id: 637, title: "Life Is Beautiful", tags: "comedy drama romance war holocaust", genres: ["Comedy", "Drama", "Romance"], overview: "A Jewish man uses humor to protect his son from the horrors of a concentration camp." },
  { id: 197, title: "Braveheart", tags: "action drama history war", genres: ["Action", "Drama", "History"], overview: "Scottish warrior William Wallace leads his countrymen in a rebellion." },
  { id: 89, title: "Indiana Jones and the Last Crusade", tags: "adventure action", genres: ["Adventure", "Action"], overview: "Indiana Jones searches for the Holy Grail while reuniting with his father." },
  { id: 562, title: "Die Hard", tags: "action thriller", genres: ["Action", "Thriller"], overview: "An NYPD officer tries to save his wife and others taken hostage by German terrorists." },
  { id: 361, title: "The Terminator", tags: "action science fiction thriller", genres: ["Action", "Sci-Fi", "Thriller"], overview: "A cyborg assassin is sent from the future to kill Sarah Connor." },
  { id: 218, title: "The Terminator 2: Judgment Day", tags: "action thriller science fiction", genres: ["Action", "Thriller", "Sci-Fi"], overview: "A cyborg is sent back to protect John Connor from a more advanced Terminator." },
  { id: 78, title: "Blade Runner", tags: "science fiction drama thriller", genres: ["Sci-Fi", "Drama", "Thriller"], overview: "A blade runner must pursue and terminate four replicants who stole a ship." },
  { id: 105, title: "Back to the Future", tags: "adventure comedy science fiction", genres: ["Adventure", "Comedy", "Sci-Fi"], overview: "Marty McFly is accidentally sent thirty years into the past." },
  { id: 9806, title: "The Incredibles", tags: "action adventure animation family superhero", genres: ["Action", "Adventure", "Animation"], overview: "A family of undercover superheroes tries to live a quiet suburban life." },
  { id: 620, title: "Ghostbusters", tags: "comedy fantasy", genres: ["Comedy", "Fantasy"], overview: "Three parapsychologists start a ghost-catching business in New York City." },
  { id: 862, title: "Toy Story", tags: "animation adventure comedy family pixar", genres: ["Animation", "Adventure", "Comedy"], overview: "A cowboy doll is profoundly threatened when a new spaceman figure takes his place." },
  { id: 863, title: "Toy Story 2", tags: "animation comedy family pixar", genres: ["Animation", "Comedy", "Family"], overview: "When Woody is stolen, Buzz and the gang launch a rescue mission." },
  { id: 10193, title: "Toy Story 3", tags: "animation family comedy pixar", genres: ["Animation", "Family", "Comedy"], overview: "The toys are mistakenly delivered to a day-care center." },
  { id: 12, title: "Finding Nemo", tags: "animation family comedy adventure pixar", genres: ["Animation", "Family", "Comedy"], overview: "A clownfish searches for his abducted son all the way to Sydney." },
  { id: 585, title: "Monsters, Inc.", tags: "animation comedy family fantasy pixar", genres: ["Animation", "Comedy", "Family"], overview: "Monsters generate power by scaring children, but they are scared of children." },
  { id: 14160, title: "Up", tags: "animation comedy family adventure pixar", genres: ["Animation", "Comedy", "Family"], overview: "An elderly widower travels to Paradise Falls with an unlikely companion." },
  { id: 920, title: "Cars", tags: "animation comedy family sport pixar", genres: ["Animation", "Comedy", "Family"], overview: "A hot-shot race car gets stranded in a small town on Route 66." },
  { id: 2062, title: "Ratatouille", tags: "animation comedy family fantasy pixar", genres: ["Animation", "Comedy", "Family"], overview: "A rat dreams of becoming a chef in Paris." },
  { id: 10681, title: "WALL·E", tags: "animation family science fiction pixar", genres: ["Animation", "Family", "Sci-Fi"], overview: "A small waste-collecting robot inadvertently embarks on a space journey." },
  { id: 8587, title: "The Lion King", tags: "animation family musical drama disney", genres: ["Animation", "Family", "Drama"], overview: "A young lion prince flees his kingdom only to learn the true meaning of responsibility." },
  { id: 812, title: "Aladdin", tags: "animation family fantasy musical disney", genres: ["Animation", "Family", "Fantasy"], overview: "A street urchin finds a magic lamp and a powerful genie." },
  { id: 808, title: "Shrek", tags: "animation comedy fantasy family dreamworks", genres: ["Animation", "Comedy", "Fantasy"], overview: "An ogre teams up with a donkey to rescue a princess." },
  { id: 809, title: "Shrek 2", tags: "animation comedy family fantasy dreamworks", genres: ["Animation", "Comedy", "Family"], overview: "Shrek and Fiona meet her parents for the first time." },
  { id: 1726, title: "Iron Man", tags: "action science fiction adventure superhero marvel", genres: ["Action", "Sci-Fi", "Adventure"], overview: "Billionaire Tony Stark builds an armored suit to fight evil." },
  { id: 102382, title: "The Amazing Spider-Man 2", tags: "action adventure fantasy superhero", genres: ["Action", "Adventure", "Fantasy"], overview: "Spider-Man confronts a new villain while Harry Osborn returns." },
  { id: 10195, title: "Thor", tags: "adventure fantasy action superhero marvel", genres: ["Adventure", "Fantasy", "Action"], overview: "The powerful Thor is cast out of Asgard to live amongst humans on Earth." },
  { id: 100402, title: "Captain America: The Winter Soldier", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "Captain America battles a new threat from history: the Soviet agent the Winter Soldier." },
  { id: 118340, title: "Guardians of the Galaxy", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "A group of intergalactic criminals must work together to stop a fanatical warrior." },
  { id: 284053, title: "Thor: Ragnarok", tags: "action adventure comedy fantasy superhero marvel", genres: ["Action", "Adventure", "Comedy"], overview: "Thor must fight for survival in a gladiatorial contest against the Hulk." },
  { id: 284054, title: "Black Panther", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "T'Challa returns home to Wakanda to take his rightful place as King." },
  { id: 299536, title: "Avengers: Infinity War", tags: "action adventure science fiction superhero marvel", genres: ["Action", "Adventure", "Sci-Fi"], overview: "The Avengers must stop Thanos from collecting all six Infinity Stones." },
  { id: 299534, title: "Avengers: Endgame", tags: "adventure science fiction action superhero marvel", genres: ["Adventure", "Sci-Fi", "Action"], overview: "The Avengers assemble one final time to reverse Thanos' actions and restore the universe." },
  { id: 597, title: "Titanic", tags: "drama romance historical disaster", genres: ["Drama", "Romance"], overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the Titanic." },
  { id: 16869, title: "Inglourious Basterds", tags: "drama thriller war quentin tarantino", genres: ["Drama", "Thriller", "War"], overview: "A Jewish cinema owner plots revenge against the Nazis who killed her family." },
  { id: 68718, title: "Django Unchained", tags: "drama western action quentin tarantino", genres: ["Drama", "Western", "Action"], overview: "A freed slave sets out to rescue his wife from a brutal Mississippi plantation owner." },
  { id: 466272, title: "Once Upon a Time in Hollywood", tags: "comedy drama western quentin tarantino", genres: ["Comedy", "Drama"], overview: "A faded TV actor and his stunt double strive to achieve fame in Hollywood." },
  { id: 49051, title: "The Hobbit: An Unexpected Journey", tags: "adventure fantasy action", genres: ["Adventure", "Fantasy", "Action"], overview: "Bilbo Baggins is swept into an epic quest to reclaim the lost Dwarf Kingdom." },
  { id: 57158, title: "The Hobbit: The Desolation of Smaug", tags: "fantasy adventure action", genres: ["Fantasy", "Adventure", "Action"], overview: "The dwarves, along with Bilbo and Gandalf, continue their quest to Erebor." },
  { id: 122917, title: "The Hobbit: The Battle of the Five Armies", tags: "action adventure fantasy", genres: ["Action", "Adventure", "Fantasy"], overview: "Bilbo and Company are forced to engage in a war against an array of armies." },
  { id: 293660, title: "Deadpool", tags: "action adventure comedy superhero", genres: ["Action", "Adventure", "Comedy"], overview: "A wisecracking mercenary gets experimented on and becomes immortal." },
  { id: 383498, title: "Deadpool 2", tags: "action comedy adventure superhero", genres: ["Action", "Comedy", "Adventure"], overview: "Deadpool forms X-Force to protect a young boy from Cable, a time-traveling mutant." },
  { id: 447365, title: "Guardians of the Galaxy Vol. 3", tags: "science fiction adventure action superhero marvel", genres: ["Sci-Fi", "Adventure", "Action"], overview: "The Guardians must protect Rocket while facing challenges from their pasts." },
];

// Simple cosine similarity calculation for recommendations
export function getRecommendations(movieTitle: string, count: number = 5): Movie[] {
  const selectedMovie = movies.find(m => m.title.toLowerCase() === movieTitle.toLowerCase());
  if (!selectedMovie) return [];

  const selectedTags = selectedMovie.tags.toLowerCase().split(' ');
  
  // Calculate similarity scores
  const scores = movies
    .filter(m => m.id !== selectedMovie.id)
    .map(movie => {
      const movieTags = movie.tags.toLowerCase().split(' ');
      const commonTags = selectedTags.filter(tag => movieTags.includes(tag));
      const similarity = commonTags.length / Math.sqrt(selectedTags.length * movieTags.length);
      return { movie, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return scores.slice(0, count).map(s => s.movie);
}

export function getRandomMovies(count: number, excludeIds: number[] = []): Movie[] {
  const available = movies.filter(m => !excludeIds.includes(m.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
