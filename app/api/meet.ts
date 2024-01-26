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
