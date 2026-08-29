import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenState = {
  token: string;
  lastTestAt: number | null;
  lastTestOk: boolean | null;
  lastTestMsg: string;
  setToken: (token: string) => void;
  setTest: (ok: boolean, msg: string) => void;
  clear: () => void;
};

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      token: "",
      lastTestAt: null,
      lastTestOk: null,
      lastTestMsg: "",
      setToken: (token) => set({ token }),
      setTest: (ok, msg) =>
        set({ lastTestOk: ok, lastTestMsg: msg, lastTestAt: Date.now() }),
      clear: () =>
        set({ token: "", lastTestAt: null, lastTestOk: null, lastTestMsg: "" }),
    }),
    { name: "tuitan-x-token" },
  ),
);
