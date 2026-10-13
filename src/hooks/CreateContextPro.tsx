import { useReducer, type ReactNode } from "react";
import { MyContext } from "../context/MyContext";
import type { User } from "../types/types";

export interface TypeState {
  user: User | null;
}

export type Action =
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" };

const initialState: TypeState = {
  user: null,
};

export type ContextType = {
  state: TypeState;
  dispatch: React.Dispatch<Action>;
};

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
      };

    default:
      return state;
  }
}

function CreateContextPro({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <MyContext.Provider value={{ state, dispatch }}>
      {children}
    </MyContext.Provider>
  );
}

export default CreateContextPro;