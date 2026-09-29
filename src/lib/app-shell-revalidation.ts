import { revalidatePath } from "next/cache";

export function revalidateAppShell(): void {
  revalidatePath("/(authenticated)", "layout");
}
