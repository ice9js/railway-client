"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRailwayUserContext } from "~/context/railway-user-context";

const Welcome = () => {
  const [key, setKey] = useState("");

  const { error, loading, setApiKey, user } = useRailwayUserContext();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void setApiKey(key);
  };

  if (user) {
    return null;
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4 p-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold">Welcome</h2>
      <p className="mb-4 text-sm text-gray-500">
        A Railway.app account key is required to proceed.
        <br />
        {`Don't worry, it'll only be stored in your browser.`}
      </p>
      <Input
        placeholder="Enter your API key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button disabled={loading || !key}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
      </Button>
    </form>
  );
};

export default Welcome;
