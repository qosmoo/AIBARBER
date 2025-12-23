
export enum Hairstyle {
  BUZZ_CUT = 'Buzz Cut',
  LONG_WAVY = 'Long Wavy',
  POMPADOUR = 'Pompadour',
  BALD = 'Bald',
  DREADLOCKS = 'Dreadlocks',
  MOHAWK = 'Mohawk',
  AFRO = 'Afro',
  UNDERCUT = 'Undercut',
  QUIFF = 'Quiff',
  SIDE_PART = 'Side Part',
  MAN_BUN = 'Man Bun',
  CREW_CUT = 'Crew Cut'
}

export enum BeardStyle {
  CLEAN_SHAVEN = 'Clean Shaven',
  FULL_BEARD = 'Full Beard',
  GOATEE = 'Goatee',
  STUBBLE = 'Stubble',
  GANDALF = 'Gandalf Beard',
  MOUSTACHE = 'Moustache',
  VAN_DYKE = 'Van Dyke',
  ANCHOR = 'Anchor Beard',
  CIRCLE_BEARD = 'Circle Beard'
}

export interface StylingOptions {
  hairstyle: Hairstyle;
  beardStyle: BeardStyle;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SavedLook {
  id: string;
  imageUrl: string;
  options: StylingOptions;
  createdAt: number;
}

export interface StylistState {
  originalImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  options: StylingOptions;
  currentUser: User | null;
  favorites: SavedLook[];
}
