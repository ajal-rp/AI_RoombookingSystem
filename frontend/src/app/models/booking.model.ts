export interface BookingRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  roomId: number;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees?: number;
  notes?: string;
  status: string;
  createdAt: string;
  rejectReason?: string;
}

export interface CreateBookingRequest {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees?: number;
  notes?: string;
}

export interface UpdateBookingRequest {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees?: number;
  notes?: string;
}

export interface RejectBookingRequest {
  rejectReason?: string;
}

