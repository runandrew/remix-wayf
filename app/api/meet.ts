import supabase from "@/api/supabase";
import { LRUCache } from "lru-cache";
import { Meet } from "@/types";

const cache = new LRUCache<string, Meet>({
    max: 200,
    ttl: 1000 * 60 * 60 * 24, // 1 day
});

export async function create(name: string): Promise<Meet> {
    const { data, error } = await supabase
        .from("meet")
        .insert([{ name }])
        .select();

    if (error) {
        throw error;
    }

    const m = data[0];

    cache.set(m.uuid, m);

    return m;
}

export async function findMeet(uuid: string): Promise<Meet> {
    if (cache.has(uuid)) {
        return Promise.resolve(cache.get(uuid) as Meet);
    }

    const res = await supabase
        .from("meet")
        .select("*")
        .eq("uuid", uuid)
        .maybeSingle();

    if (res.error) {
        throw res.error;
    }

    cache.set(uuid, res.data);

    return res.data;
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
        [group]: dates.map((d) => ({
            day: d.toISOString(),
        })),
    };

    const { error } = await supabase
        .from("meet")
        .update({ availabilities: updatedAvails })
        .eq("uuid", uuid);

    cache.delete(uuid);

    if (error) {
        throw error;
    }

    return;
}
