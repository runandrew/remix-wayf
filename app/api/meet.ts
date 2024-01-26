import supabase from "@/api/supabase";
import { Meet } from "@/types";

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
    const res = await supabase
        .from("meet")
        .select("*")
        .eq("uuid", uuid)
        .maybeSingle();

    if (res.error) {
        throw res.error;
    }

    return res.data;
}

export async function addMeetAvails(
    uuid: string,
    group: string,
    dates: Date[]
): Promise<void> {
    const meet = await findMeet(uuid);
    const avails = meet.availabilities;

    console.log("in add meet avails", dates);

    const updatedAvails = {
        ...avails,
        [group]: dates.map((d) => ({
            day: d.toISOString(),
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
