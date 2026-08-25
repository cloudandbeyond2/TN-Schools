// The 20 "/command" prompt set now lives in the AI Content Studio, where each
// command has its own prompt, schema, renderer and subject adaptation. This
// route stays so existing links and bookmarks keep working.

import { redirect } from "next/navigation";

export default function AIPromptsPage() {
  redirect("/teacher/ai-studio");
}
