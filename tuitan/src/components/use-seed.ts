import { useQuery } from "@tanstack/react-query";
import { ensureSeeded } from "@/lib/server/scout";

export function useSeed() {
  return useQuery({
    queryKey: ["seed"],
    queryFn: () => ensureSeeded(),
    staleTime: Infinity,
  });
}
