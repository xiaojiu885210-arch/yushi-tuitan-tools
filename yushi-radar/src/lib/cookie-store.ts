import { create } from "zustand";
import { persist } from "zustand/middleware";

type CookieState = {
  cookie: string;
  lastTestAt: number | null;
  lastTestOk: boolean | null;
  lastTestMsg: string;
  setCookie: (cookie: string) => void;
  setTest: (ok: boolean, msg: string) => void;
  clear: () => void;
};

export const useCookieStore = create<CookieState>()(
  persist(
    (set) => ({
      cookie: "",
      lastTestAt: null,
      lastTestOk: null,
      lastTestMsg: "",
      setCookie: (cookie) => set({ cookie }),
      setTest: (ok, msg) =>
        set({ lastTestOk: ok, lastTestMsg: msg, lastTestAt: Date.now() }),
      clear: () =>
        set({ cookie: "", lastTestAt: null, lastTestOk: null, lastTestMsg: "" }),
    }),
    { name: "yushi-cookie" },
  ),
);
