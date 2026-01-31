import { createClient } from 'https://esm.sh/@supabase/supabase-js';
console.log(createClient);


const supaUrl = 'https://srjpepewfuumaqgadyoe.supabase.co';
const supaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanBlcGV3ZnV1bWFxZ2FkeW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzk3MTEsImV4cCI6MjA4MDY1NTcxMX0.9UUk7eGAl0mEpddg3brdIsOB_diT4R8IJ6YTh-zptbU'; // Isay Anon Key banayein


const supabase = createClient(supaUrl, supaKey);
// console.log(createClient);

export default supabase;