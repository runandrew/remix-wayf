import { createSupabaseClient } from "~/api/repositories/supabaseConfig";
import { Availabilities, Availability, Meet } from "@/types";

export async function create(name: string, uuid: string): Promise<Meet> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("meet")
    .insert([{ name, uuid }])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
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

  // Clean up dates to only the yyyy-mm-dd
  // Hack to deal with data in the database that has time
  // and timzones attached.
  const cleanMeet = {
    ...res.data,
    availabilities: Object.entries<Availability[]>(
      res.data.availabilities,
    ).reduce(
      (acc, [key, avails]) => ({
        ...acc,
        [key]: avails.map((a) => ({
          day: a.day.slice(0, 10), // Creates "yyyy-MM-dd"
        })),
      }),
      {},
    ),
  };

  return cleanMeet;
}

export async function updateAvailabilities(
  uuid: string,
  availabilities: Availabilities,
): Promise<Meet> {
  const supabase = createSupabaseClient();

  console.log("Supabase updating: ", { uuid, availabilities });

  const { data, error } = await supabase
    .from("meet")
    .update({ availabilities })
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    throw error;
  }

  console.log("Supabase updated: ", data);

  return data;
}
