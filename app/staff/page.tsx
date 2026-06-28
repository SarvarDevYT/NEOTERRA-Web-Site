import { Metadata } from "next";
import { getStaffAction } from "@/app/actions/staff";
import StaffClient from "./StaffClient";

export const metadata: Metadata = {
  title: "Jamoa - NeoTerra",
  description: "NeoTerra serverining rasmiy jamoasi bilan tanishing.",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getStaffAction();

  return <StaffClient initialStaff={staff} />;
}
