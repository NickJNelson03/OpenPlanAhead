export const PROGRAMS = [
  { name: "African Diaspora Studies", types: ["concentration"] },
  { name: "American Studies", types: ["major", "concentration"] },
  { name: "Anthropology", types: ["major", "minor"] },
  { name: "Arabic", types: ["major", "minor"] },
  { name: "Art History", types: ["major", "minor"] },
  { name: "Asian and Middle East Studies", types: ["major", "concentration"] },
  { name: "Astronomy", types: ["minor"] },
  { name: "Biochemistry", types: ["major"] },
  { name: "Biology", types: ["major", "minor"] },
  { name: "Chemistry", types: ["major", "minor"] },
  { name: "Chinese", types: ["major", "minor"] },
  { name: "Classical Civilization", types: ["major"] },
  { name: "Classics", types: ["major", "minor"] },
  { name: "Computing", types: ["concentration"] },
  { name: "Dance", types: ["major", "minor"] },
  { name: "Drama", types: ["major"] },
  { name: "Economics", types: ["major"] },
  { name: "English", types: ["major", "minor"] },
  { name: "Environmental Studies", types: ["major", "concentration"] },
  { name: "Film", types: ["major"] },
  { name: "French", types: ["major", "minor"] },
  { name: "Gender & Sexuality Studies", types: ["major", "concentration"] },
  { name: "German", types: ["major", "minor"] },
  { name: "Greek", types: ["major", "minor"] },
  { name: "History", types: ["major", "minor"] },
  { name: "Integrated Program in Humane Studies", types: ["concentration"] },
  { name: "International Studies", types: ["major"] },
  { name: "Islamic Civilizations and Cultures", types: ["concentration"] },
  { name: "Italian", types: ["major", "minor"] },
  { name: "Japanese", types: ["major", "minor"] },
  { name: "Latin", types: ["major", "minor"] },
  { name: "Latine Studies", types: ["concentration"] },
  { name: "Law & Society", types: ["concentration"] },
  { name: "Mathematics & Statistics", types: ["major", "minor"] },
  { name: "Modern Languages and Literatures", types: ["major"] },
  { name: "Molecular Biology", types: ["major"] },
  { name: "Music", types: ["major", "minor"] },
  { name: "Neuroscience", types: ["major", "concentration"] },
  { name: "Philosophy", types: ["major", "minor"] },
  { name: "Physics", types: ["major", "minor"] },
  { name: "Political Science", types: ["major"] },
  { name: "Psychology", types: ["major"] },
  { name: "Public Policy", types: ["concentration"] },
  { name: "Religious Studies", types: ["major", "minor"] },
  { name: "Russian", types: ["major", "minor"] },
  { name: "Sociology", types: ["major"] },
  { name: "Spanish", types: ["major", "minor"] },
  { name: "Statistics", types: ["minor"] },
  { name: "Studio Art", types: ["major", "minor"] },
];

export const MAJOR_OPTIONS = PROGRAMS
  .filter((program) => program.types.includes("major"))
  .map((program) => program.name)
  .sort();

export const MINOR_OPTIONS = PROGRAMS
  .filter((program) => program.types.includes("minor"))
  .map((program) => program.name)
  .sort();

export const CONCENTRATION_OPTIONS = PROGRAMS
  .filter((program) => program.types.includes("concentration"))
  .map((program) => program.name)
  .sort();