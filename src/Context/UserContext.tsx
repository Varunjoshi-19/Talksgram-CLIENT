import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from "react";

interface UserContextPayload {
    user: User | null;
    profile: any;
    dispatch: Dispatch<Action>

}


interface AuthContextProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    username: string;
    email: string;
}

interface State {
    profile: any;
    user: User | null;
    logout: boolean;
}

interface Action {
    type: typeof ACTIONS[keyof typeof ACTIONS];
    payload?: User;
}

const AuthContext = createContext<UserContextPayload | undefined>(undefined);

export const ACTIONS = {
    SET_USER: "set",
    SET_PROFILE: "SET_PROFILE",
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

        case ACTIONS.SET_PROFILE:
            return { ...state, profile: action.payload || null }

        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, { profile: null, user: null, logout: true });

    useEffect(() => {

        function fetchUserDetails() {

            const userToken = localStorage.getItem("user-token");
            try {
                if (userToken) {

                    const parsedUser = JSON.parse(userToken);
                    dispatch({ type: ACTIONS.SET_USER, payload: parsedUser });
                }
            } catch (error) {
                console.error("Failed to parse user token:", error);
            }

        }
        async function fetchUserProfile() {
            const profile = localStorage.getItem("profile-details");
            if (profile) {
                const parsedProfile = JSON.parse(profile);
                dispatch({ type: ACTIONS.SET_PROFILE, payload: parsedProfile });
            }
        }


        fetchUserDetails();
        fetchUserProfile();

    }, []);



    return (
        <AuthContext.Provider value={{ user: state.user, profile: state.profile, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
