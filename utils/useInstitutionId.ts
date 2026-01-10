import { institutionStorage } from "@/utils/institutionStorage";
import { useEffect, useState } from "react";
import { useAuth } from "../store/hooks/useAuth";

export const useInstitutionId = () => {
  const { user } = useAuth();
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (user?.institution) {
        setInstitutionId(user.institution.$id);
      } else {
        const stored = await institutionStorage.getInstitutionId();
        setInstitutionId(stored);
      }
    };
    load();
  }, [user]);

  return institutionId;
};
