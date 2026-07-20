import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { logoutUser } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return logoutUser(request);
}

export async function loader({ request }: ActionFunctionArgs) {
  return logoutUser(request);
}
