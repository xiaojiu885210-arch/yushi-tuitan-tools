import { useQuery } from "@tanstack/react-query";
import { ensureSeeded } from "@/lib/server/listings";

export function useSeed() {
  return useQuery({
    queryKey: ["seed"],
    queryFn: () => ensureSeeded(),
    staleTime: Infinity,
  });
}
