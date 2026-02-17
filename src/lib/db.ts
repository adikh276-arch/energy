import { supabase, setUserContext } from './supabase';

export async function upsertUser(userId: number): Promise<void> {
  await setUserContext(userId);
  const { error } = await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });
  if (error) throw error;
}

import { EnergyLog, EnergyAction } from '@/types/energy';

export async function saveEnergyLog(userId: number, log: EnergyLog) {
  await setUserContext(userId);
  const { error } = await supabase
    .from('energy_logs')
    .insert({
      user_id: userId,
      logged_at: log.timestamp,
      level: log.level,
      energy_type: log.energyType.toLowerCase(),
      factors: log.factors,
      tobacco_urge: log.tobaccoUrge.toLowerCase(),
      physical_activity: log.physicalActivity.toLowerCase(),
      meals: log.meals,
      water_ml: log.waterMl,
      notes: log.notes
    });
  if (error) throw error;
}

export async function getEnergyLogs(userId: number): Promise<EnergyLog[]> {
  await setUserContext(userId);
  const { data, error } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data.map(d => ({
    id: d.id,
    timestamp: d.logged_at,
    level: d.level,
    energyType: d.energy_type.charAt(0).toUpperCase() + d.energy_type.slice(1),
    factors: d.factors,
    tobaccoUrge: d.tobacco_urge.charAt(0).toUpperCase() + d.tobacco_urge.slice(1),
    physicalActivity: d.physical_activity.charAt(0).toUpperCase() + d.physical_activity.slice(1),
    meals: d.meals,
    waterMl: d.water_ml,
    notes: d.notes
  }));
}

export async function deleteEnergyLog(userId: number, id: string) {
  await setUserContext(userId);
  const { error } = await supabase
    .from('energy_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function saveEnergyAction(userId: number, actionType: string) {
  await setUserContext(userId);
  const { error } = await supabase
    .from('energy_actions')
    .insert({
      user_id: userId,
      logged_at: new Date().toISOString(),
      action_type: actionType.toLowerCase()
    });
  if (error) throw error;
}

export async function getEnergyActions(userId: number): Promise<EnergyAction[]> {
  await setUserContext(userId);
  const { data, error } = await supabase
    .from('energy_actions')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data.map(d => ({
    type: d.action_type.charAt(0).toUpperCase() + d.action_type.slice(1),
    timestamp: d.logged_at
  }));
}
