export interface Room {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  location?: string;
  amenities?: string[];
}
