import supabase from "@/api/supabase";
import { Availability, Meet } from "@/types";

export async function create(name: string): Promise<Meet> {
  const { data, error } = await supabase
    .from("meet")
    .insert([{ name }])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

export async function findMeet(uuid: string): Promise<Meet> {
  console.log("findMeet", uuid);
  const res = await supabase
    .from("meet")
    .select("*")
    .eq("uuid", uuid)
    .maybeSingle();

  console.log("findMeet res", res);

  if (res.error) {
    throw res.error;
  }

  console.log("findMeet cleanMeet", res.data);

  // Clean up dates to only the yyyy-mm-dd
  // Hack to deal with data in the database that has time
  // and timzones attached.
  const cleanMeet = {
    ...res.data,
    availabilities: Object.entries<Availability[]>(
      res.data.availabilities
    ).reduce(
      (acc, [key, avails]) => ({
        ...acc,
        [key]: avails.map((a) => ({
          day: a.day.slice(0, 10), // Creates "yyyy-MM-dd"
        })),
      }),
      {}
    ),
  };

  return cleanMeet;
}

export async function addMeetAvails(
  uuid: string,
  group: string,
  dates: Date[]
): Promise<void> {
  const meet = await findMeet(uuid);
  const avails = meet.availabilities;

  const updatedAvails = {
    ...avails,
    [group]: dates
      .filter((d) => d.toString() !== "Invalid Date")
      .map((d) => ({
        day: d.toISOString().slice(0, 10), // Creates "yyyy-MM-dd"
      })),
  };

  const { data, error } = await supabase
    .from("meet")
    .update({ availabilities: updatedAvails })
    .eq("uuid", uuid)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
