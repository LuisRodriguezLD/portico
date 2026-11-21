import type { Announcement, SchoolEvent } from "./types";

type AudienceItem = Pick<Announcement | SchoolEvent, "audience" | "audienceRef">;
type Viewer = { grade: string; homeroomId: string };

export function visibleTo<T extends AudienceItem>(items: T[], students: Viewer[]) {
  return items.filter((item) => {
    if (item.audience === "school") return true;
    if (item.audience === "grade") return students.some((child) => child.grade === item.audienceRef);
    return students.some((child) => child.homeroomId === item.audienceRef);
  });
}
