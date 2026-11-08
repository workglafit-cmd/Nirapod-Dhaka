import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hoiqjshasdechwufjfoy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXFqc2hhc2RlY2h3dWZqZm95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3NDI3MSwiZXhwIjoyMTAxMDUwMjcxfQ.x0uzO7nYN1yhmRzTh32WwZBV7wb5YWvYtLvfJMnM9lo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const usersToCreate = [
  { email: 'police@nirapod.com', password: 'police1234', full_name: 'Bangladesh Police Headquarters', role: 'police' },
  { email: 'disaster@nirapod.com', password: 'disaster1234', full_name: 'Disaster Management Bureau', role: 'dmb' },
  { email: 'city@nirapod.com', password: 'city1234', full_name: 'City Corporation Admin', role: 'city_corp' }
];

async function run() {
  console.log("Fetching existing users...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError);
    return;
  }

  // 1. Delete corrupted users if they exist
  for (const target of usersToCreate) {
    const existing = users.find(u => u.email === target.email);
    if (existing) {
      console.log(`Deleting existing corrupted user: ${target.email}`);
      await supabase.auth.admin.deleteUser(existing.id);
    }
  }

  // 2. Create users cleanly
  for (const target of usersToCreate) {
    console.log(`Creating user cleanly: ${target.email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: target.email,
      password: target.password,
      email_confirm: true,
      user_metadata: { full_name: target.full_name }
    });

    if (error) {
      console.error(`Failed to create ${target.email}:`, error.message);
      continue;
    }

    const userId = data.user.id;
    console.log(`Created! ID: ${userId}. Now assigning role: ${target.role}`);

    // Wait a brief moment for the database trigger to create the profile row
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Update the role in public.profiles
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: target.role })
      .eq('id', userId);

    if (roleError) {
      console.error(`Failed to assign role to ${target.email}:`, roleError.message);
    } else {
      console.log(`Role '${target.role}' successfully assigned to ${target.email}!`);
    }
  }

  console.log("All done!");
}

run();
