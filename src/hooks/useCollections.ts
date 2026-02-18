import { useState } from "react";
import { Collection } from "../types";
import { fetchCollections } from "../lib/api";

export function useCollections() {
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [orgCollections, setOrgCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCollections = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [myResult, orgResult] = await Promise.all([
        fetchCollections("my_collections"),
        fetchCollections("org_collections"),
      ]);
      setMyCollections(myResult);
      setOrgCollections(orgResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Error fetching collections:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myCollections,
    orgCollections,
    isLoading,
    error,
    refetch: fetchAllCollections,
  };
}
