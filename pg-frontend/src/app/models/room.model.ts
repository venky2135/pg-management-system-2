export interface Room {
  id?: number;
  roomNumber: string;
  floor: string;
  roomType: string;
  rentAmount: number;
  isBooked: boolean;
  isAc: boolean;
  student?: Student;
}

export interface Student {
  id?: number;
  name: string;
  email: string;
}
