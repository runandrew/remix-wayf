export interface Meet {
  uuid: string;
  name: string;
  availabilities: Availabilities;
}

export type Availabilities = Record<string, Availability[]>;

export interface Availability {
  day: string;
}
