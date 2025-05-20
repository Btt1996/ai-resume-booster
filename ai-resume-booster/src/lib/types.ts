// src/lib/types.ts

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Basics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
  profiles?: Profile[];
}

export interface Work {
  name?: string; // Company name
  position?: string;
  company?: string; // JSONResume uses 'name' for company, but 'company' is also common. Let's allow both for parsing flexibility.
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string; // Overall description of the role
  highlights?: string[]; // Bullet points
}

export interface EducationItem {
  institution?: string;
  url?: string;
  area?: string; // e.g. Computer Science
  studyType?: string; // e.g. Bachelor, Master
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface SkillItem {
  name?: string;
  level?: string; // e.g. Advanced, Intermediate
  keywords?: string[]; // Specific technologies/tools under this skill category
}

export interface JsonResume {
  basics?: Basics;
  work?: Work[];
  education?: EducationItem[];
  skills?: SkillItem[];
  // Placeholder for other sections if needed by themes
  awards?: any[];
  publications?: any[];
  languages?: any[];
  interests?: any[];
  references?: any[];
  projects?: any[];
}

