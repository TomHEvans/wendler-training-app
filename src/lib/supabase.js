import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabase = supabaseUrl && supabaseKey;

const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Storage abstraction - uses Supabase if configured, localStorage fallback
const storage = {
  async getPlan(weekId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('plans')
        .select('data')
        .eq('id', weekId)
        .single();
      if (error && error.code !== 'PGRST116') console.error('getPlan error:', error);
      return data?.data || null;
    }
    const stored = localStorage.getItem(`plan-${weekId}`);
    return stored ? JSON.parse(stored) : null;
  },

  async savePlan(weekId, planData) {
    if (supabase) {
      const { error } = await supabase
        .from('plans')
        .upsert({ id: weekId, data: planData, updated_at: new Date().toISOString() });
      if (error) console.error('savePlan error:', error);
    }
    localStorage.setItem(`plan-${weekId}`, JSON.stringify(planData));
  },

  async getAllPlans() {
    if (supabase) {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('id');
      if (error) console.error('getAllPlans error:', error);
      return (data || []).map(row => ({ id: row.id, ...row.data }));
    }
    const plans = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('plan-')) {
        const plan = JSON.parse(localStorage.getItem(key));
        plans.push({ id: key.replace('plan-', ''), ...plan });
      }
    }
    return plans.sort((a, b) => a.id.localeCompare(b.id));
  },

  async getCompletions(dayDate) {
    if (supabase) {
      const { data, error } = await supabase
        .from('completions')
        .select('exercise_key, completed')
        .eq('day_date', dayDate);
      if (error) console.error('getCompletions error:', error);
      const map = {};
      (data || []).forEach(r => { map[r.exercise_key] = r.completed; });
      return map;
    }
    const stored = localStorage.getItem(`completions-${dayDate}`);
    return stored ? JSON.parse(stored) : {};
  },

  async toggleCompletion(exerciseKey, dayDate, completed) {
    if (supabase) {
      const { error } = await supabase
        .from('completions')
        .upsert({
          exercise_key: exerciseKey,
          day_date: dayDate,
          completed,
          completed_at: new Date().toISOString()
        }, { onConflict: 'exercise_key,day_date' });
      if (error) console.error('toggleCompletion error:', error);
    }
    const completions = await this.getCompletions(dayDate);
    completions[exerciseKey] = completed;
    localStorage.setItem(`completions-${dayDate}`, JSON.stringify(completions));
  },

  async addChangelog(action, details, weekId) {
    if (supabase) {
      const { error } = await supabase
        .from('changelog')
        .insert({ action, details, week_id: weekId });
      if (error) console.error('addChangelog error:', error);
    }
    const logs = JSON.parse(localStorage.getItem('changelog') || '[]');
    logs.unshift({
      id: crypto.randomUUID(),
      action,
      details,
      week_id: weekId,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('changelog', JSON.stringify(logs));
  },

  async getChangelog() {
    if (supabase) {
      const { data, error } = await supabase
        .from('changelog')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) console.error('getChangelog error:', error);
      return data || [];
    }
    return JSON.parse(localStorage.getItem('changelog') || '[]');
  }
};

export { supabase, storage, hasSupabase };
