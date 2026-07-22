import { redirect } from "next/navigation";

export default function MiddleSchoolPortfolioRedirect() {
  redirect("/student/portfolio");
  return null;
}
