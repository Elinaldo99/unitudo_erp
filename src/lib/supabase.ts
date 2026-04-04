import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdkmtbljefyvztfsfdzx.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiRkbAriv7BecGR6u44XQ_lJiKnTW6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
