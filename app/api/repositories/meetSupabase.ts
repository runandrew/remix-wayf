import { createSupabaseClient } from "~/api/repositories/supabaseConfig";
import { Availabilities, Availability, Meet } from "@/types";

export type SupabaseMeet = {
  uuid: string;
  name: string;
  availabilities: Availabilities;
  migrated: boolean;
  created_at: string;
};

function supabaseMeetToMeet(meet: SupabaseMeet): Meet {
  return {
    uuid: meet.uuid,
    name: meet.name,
    availabilities: meet.availabilities,
    createdAt: new Date(meet.created_at),
    updatedAt: new Date(meet.created_at),
  };
}

// Older meets have a time attached to the date.
// This function cleans the date to only the yyyy-mm-dd
function cleanMeet(meet: Meet): Meet {
  return {
    ...meet,
    availabilities: Object.entries<Availability[]>(meet.availabilities).reduce(
      (acc, [key, avails]) => ({
        ...acc,
        [key]: avails.map((a) => ({
          day: a.day.slice(0, 10), // Creates "yyyy-MM-dd"
        })),
      }),
      {},
    ),
  };
}

export async function create(name: string, uuid: string): Promise<Meet> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("meet")
    .insert([{ name, uuid }])
    .select();

  if (error) {
    throw error;
  }

  return supabaseMeetToMeet(data[0]);
}

export async function find(uuid: string): Promise<Meet> {
  const supabase = createSupabaseClient();
  const res = await supabase
    .from("meet")
    .select("*")
    .eq("uuid", uuid)
    .maybeSingle();

  if (res.error) {
    throw res.error;
  }

  return cleanMeet(supabaseMeetToMeet(res.data));
}

export async function updateAvailabilities(
  uuid: string,
  availabilities: Availabilities,
): Promise<Meet> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("meet")
    .update({ availabilities })
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return supabaseMeetToMeet(data);
}

export async function setMigrated(
  uuid: string,
  migrated: boolean,
): Promise<Meet> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("meet")
    .update({ migrated })
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return supabaseMeetToMeet(data);
}

export async function listUnmigratedUuids(
  limit: number = 10,
): Promise<string[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("meet")
    .select("uuid")
    .eq("migrated", false)
    .limit(limit);

  if (error) {
    throw error;
  }

  return data.map((d) => d.uuid);
}
