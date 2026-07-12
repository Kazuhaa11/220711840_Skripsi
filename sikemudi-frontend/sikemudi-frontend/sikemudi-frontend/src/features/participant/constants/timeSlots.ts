export interface ParticipantTimeSlotOption {
  id: number;
  label: string;
  name: string;
  timeRange: string;
  durationMinutes: number;
}

// Patch 4: opsi slot mengikuti seed data time_slots backend saat ini.
// Nanti jika endpoint slot peserta sudah dipublikasikan, list ini bisa diganti menjadi data API.
export const PARTICIPANT_TIME_SLOT_OPTIONS: ParticipantTimeSlotOption[] = [
  {
    id: 1,
    label: "Pagi 1 • 08:00 - 10:00",
    name: "Pagi 1",
    timeRange: "08:00 - 10:00",
    durationMinutes: 120,
  },
  {
    id: 2,
    label: "Pagi 2 • 10:00 - 12:00",
    name: "Pagi 2",
    timeRange: "10:00 - 12:00",
    durationMinutes: 120,
  },
  {
    id: 3,
    label: "Siang • 13:00 - 15:00",
    name: "Siang",
    timeRange: "13:00 - 15:00",
    durationMinutes: 120,
  },
  {
    id: 4,
    label: "Sore • 15:00 - 17:00",
    name: "Sore",
    timeRange: "15:00 - 17:00",
    durationMinutes: 120,
  },
];
