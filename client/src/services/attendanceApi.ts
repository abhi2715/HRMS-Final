import api from './api';
import { AttendanceStatus } from '../../../shared/types/enums';

export interface AttendanceRecord {
  _id: string;
  user: string;
  team?: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  duration?: number;
  notes?: string;
  correctedBy?: string;
  correctionReason?: string;
  correctionTimestamp?: string;
  originalValues?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  [AttendanceStatus.PRESENT]: number;
  [AttendanceStatus.ABSENT]: number;
  [AttendanceStatus.HALF_DAY]: number;
  [AttendanceStatus.ON_LEAVE]: number;
  [AttendanceStatus.HOLIDAY]: number;
  [AttendanceStatus.WEEKLY_OFF]: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  halfDay: number;
  total: number;
  rate: number;
}

export const attendanceApi = {
  checkIn: async (): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  checkOut: async (): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  getHistory: async (month?: number, year?: number): Promise<AttendanceRecord[]> => {
    let url = '/attendance/history';
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getToday: async (): Promise<AttendanceRecord | null> => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getTeamAttendance: async (teamId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
    let url = `/attendance/team/${teamId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getOrganizationAttendance: async (startDate?: string, endDate?: string, teamId?: string): Promise<AttendanceRecord[]> => {
    let url = '/attendance/organization';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (teamId) params.append('teamId', teamId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<AttendanceSummary> => {
    let url = '/attendance/summary';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getTrends: async (days?: number): Promise<AttendanceTrend[]> => {
    let url = '/attendance/trends';
    if (days) {
      url += `?days=${days}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  correctRecord: async (id: string, payload: { checkIn?: string | null; checkOut?: string | null; status?: AttendanceStatus; notes?: string; correctionReason: string }): Promise<AttendanceRecord> => {
    const response = await api.put(`/attendance/${id}/correct`, payload);
    return response.data;
  },
};
