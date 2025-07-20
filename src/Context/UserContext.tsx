import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from "react";


interface AuthContextProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    username: string;
    email: string;
}

interface State {
    user: User | null;
    logout: boolean;
}

interface Action {
    type: typeof ACTIONS[keyof typeof ACTIONS];
    payload?: User;
}

const AuthContext = createContext<{ user: User | null; dispatch: Dispatch<Action> } | undefined>(undefined);

export const ACTIONS = {
    SET_USER: "set",
    REMOVE_USER: "remove",
} as const;

export function useUserAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useUserAuthContext must be used within an AuthContextProvider");
    }
    return context;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ACTIONS.SET_USER:
            return { ...state, user: action.payload || null, logout: false };
        case ACTIONS.REMOVE_USER:
            return { ...state, user: null, logout: true };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, { user: null, logout: true });

    useEffect(() => {
        const userToken = localStorage.getItem("user-token");
        try {
            if (userToken) {

                const parsedUser = JSON.parse(userToken);
                dispatch({ type: ACTIONS.SET_USER, payload: parsedUser });
            }
        } catch (error) {
            console.error("Failed to parse user token:", error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user: state.user, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
