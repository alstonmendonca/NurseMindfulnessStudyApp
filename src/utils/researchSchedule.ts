import { supabase } from './supabase';
import { differenceInDays } from 'date-fns';
import { scheduleResearchCheckIn } from './notifications';
import { getDeviceId } from './deviceId';

export type CheckInType = 'PSS4' | 'COPE' | 'WHO5';

interface CheckInSchedule {
  type: CheckInType;
  intervalDays: number;
  title: string;
  message: string;
}

const CHECK_IN_SCHEDULES: CheckInSchedule[] = [
  {
    type: 'PSS4',
    intervalDays: 7,
    title: 'Stress Assessment Due',
    message: 'Time to complete your weekly stress assessment (PSS-4).'
  },
  {
    type: 'COPE',
    intervalDays: 7,
    title: 'Coping Strategies Survey Due',
    message: 'Time to complete your weekly coping strategies survey.'
  },
  {
    type: 'WHO5',
    intervalDays: 14,
    title: 'Well-Being Check Due',
    message: 'Time to complete your bi-weekly well-being assessment.'
  }
];

export const canTakeCheckIn = async (participantId: number, type: CheckInType): Promise<boolean> => {
  try {
    const { data: lastCheckIn, error } = await supabase
      .from('research_check_ins')
      .select('created_at')
      .eq('participant_id', participantId)
      .eq('check_in_type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {  // PGRST116 is "no rows returned"
      throw error;
    }

    if (!lastCheckIn) return true;

    const schedule = CHECK_IN_SCHEDULES.find(s => s.type === type);
    if (!schedule) return false;

    const daysSinceLastCheckIn = differenceInDays(
      new Date(),
      new Date(lastCheckIn.created_at)
    );

    return daysSinceLastCheckIn >= schedule.intervalDays;
  } catch (error) {
    console.error('Error checking survey availability:', error);
    return false;
  }
};

export const scheduleNextCheckIn = async (participantId: number, type: CheckInType) => {
  const schedule = CHECK_IN_SCHEDULES.find(s => s.type === type);
  if (!schedule) return;

  try {
    const deviceId = await getDeviceId();
    const identifier = `${type}_${participantId}_${deviceId}`;

    // Schedule next notification using our notifications utility
    await scheduleResearchCheckIn(type.toLowerCase() as 'pss4' | 'cope' | 'who5', schedule.intervalDays);
  } catch (error) {
    console.error('Error scheduling next check-in notification:', error);
  }
};

export const getNextCheckInDays = async (participantId: number, type: CheckInType): Promise<number | null> => {
  try {
    // Get the schedule first to ensure we have valid interval days
    const schedule = CHECK_IN_SCHEDULES.find(s => s.type === type);
    if (!schedule) {
      console.error(`No schedule found for check-in type: ${type}`);
      return null;
    }

    const { data: lastCheckIn, error } = await supabase
      .from('research_check_ins')
      .select('created_at')
      .eq('participant_id', participantId)
      .eq('check_in_type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no check-in exists or we get PGRST116 (no rows), it's available now
    if (error?.code === 'PGRST116' || !lastCheckIn) {
      return 0;
    }

    // For any other errors, throw them
    if (error) {
      throw error;
    }

    const daysSinceLastCheckIn = differenceInDays(
      new Date(),
      new Date(lastCheckIn.created_at)
    );

    const daysRemaining = schedule.intervalDays - daysSinceLastCheckIn;
    return daysRemaining > 0 ? daysRemaining : 0;
  } catch (error) {
    console.error('Error calculating next check-in:', error);
    throw error; // Let the component handle the error
  }
};
