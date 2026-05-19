import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://zllmuvopkocmobleqtix.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG11dm9wa29jbW9ibGVxdGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjIzNzYsImV4cCI6MjA5NDczODM3Nn0.7ZkuQcbjdqro_50d7KG5baXXHJo3Ypzc16_m37HIbW4',
)
