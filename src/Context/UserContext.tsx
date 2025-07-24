import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from "react";
import { ProfilePayload } from "../Interfaces";


interface UserContextPayload {
    profile: ProfilePayload | null;
    dispatch: Dispatch<Action>

}

interface AuthContextProviderProps {
    children: ReactNode;
}

interface State {
    profile: ProfilePayload | null;
    logout: boolean;
}

interface Action {
    type: typeof ACTIONS[keyof typeof ACTIONS];
    payload?: ProfilePayload;
}

const AuthContext = createContext<UserContextPayload | undefined>(undefined);

export const ACTIONS = {
    SET_PROFILE: "SET_PROFILE",
    REMOVE_PROFILE: "REMOVE_PROFILE",
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
        case ACTIONS.SET_PROFILE:
            return { ...state, profile: action.payload || null };

        case ACTIONS.REMOVE_PROFILE:
            return { ...state, profile: null };

        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, { profile: null, logout: true });

    useEffect(() => {

        function fetchUserDetails() {

            const profile = localStorage.getItem("profile-details");
            try {
                if (profile) {

                    const parsedProfile = JSON.parse(profile);
                    dispatch({ type: ACTIONS.SET_PROFILE, payload: parsedProfile });
                }
            } catch (error) {
                console.error("Failed to parse user token:", error);
            }

        }

        fetchUserDetails();

    }, []);

    return (
        <AuthContext.Provider value={{ profile: state.profile, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
