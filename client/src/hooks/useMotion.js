import { createContext, useContext } from "react";

export const MotionContext = createContext({ enabled: false });
export function useMotion() { return useContext(MotionContext); }
