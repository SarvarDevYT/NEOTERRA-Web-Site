import { Metadata } from "next";
import { getBansAction, getMutesAction, getPlayerNameAction } from "@/app/actions/litebans";
import BansClient from "./BansClient";

export const metadata: Metadata = {
  title: "Jazolar Ro'yxati - NeoTerra",
  description: "NeoTerra serveridagi barcha faol va o'tmishdagi jazolarni ko'ring.",
};

export const dynamic = "force-dynamic";

export default async function BansPage() {
  const bansRes = await getBansAction();
  const mutesRes = await getMutesAction();

  const rawBans = bansRes.success ? bansRes.data : [];
  const rawMutes = mutesRes.success ? mutesRes.data : [];
  const dbError = bansRes.error || mutesRes.error || null;

  // Resolve player usernames on the server side
  const bans = await Promise.all(
    rawBans.map(async (ban: any) => {
      const username = await getPlayerNameAction(ban.uuid);
      return { ...ban, username };
    })
  );

  const mutes = await Promise.all(
    rawMutes.map(async (mute: any) => {
      const username = await getPlayerNameAction(mute.uuid);
      return { ...mute, username };
    })
  );

  return <BansClient initialBans={bans} initialMutes={mutes} dbError={dbError} />;
}
