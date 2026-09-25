import Link from "next/link";

import { roundedTileClassName } from "@/lib/rounded-tile";

import { athleteInitials } from "./athlete-meta";
import { AthleteAvatarImage } from "./athlete-avatar-image";

const avatarClassName = `flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-[#2a2f38] text-xs font-semibold text-white ${roundedTileClassName}`;

type DashboardAthletePhotoProps = {
  athleteName: string;
  profileHref: string;
  avatarUrl: string | null;
  photoAlt: string;
};

export function DashboardAthletePhoto({
  athleteName,
  profileHref,
  avatarUrl,
  photoAlt,
}: DashboardAthletePhotoProps) {
  if (!avatarUrl) {
    return null;
  }

  return (
    <Link href={profileHref} className={avatarClassName} aria-label={photoAlt}>
      <AthleteAvatarImage src={avatarUrl} alt="" initials={athleteInitials(athleteName)} />
    </Link>
  );
}
