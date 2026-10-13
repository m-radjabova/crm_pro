import { createContext} from "react";
import type { ContextType } from "../hooks/CreateContextPro";


export const MyContext = createContext<ContextType | undefined>(undefined);