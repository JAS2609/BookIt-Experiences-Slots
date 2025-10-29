export interface ExperienceSlot {
  id: string;
  dateId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceDate {
  id: string;
  experienceId: string;
  date: string;
  isActive: boolean;
  timeSlots: ExperienceSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  details: string | null;
  availability: boolean;
  price: number;
  about: string | null;
  location: string;
  imageUrl: string | null;
  dates: ExperienceDate[];
  createdAt: string;
  updatedAt: string;
}