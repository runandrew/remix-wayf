export interface Meet {
  uuid: string;
  name: string;
  availabilities: Availabilities;
  createdAt: Date;
  updatedAt: Date;
}

export type Availabilities = Record<string, Availability[]>;

export interface Availability {
  day: string;
}
