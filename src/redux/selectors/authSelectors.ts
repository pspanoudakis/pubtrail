import { RootState } from "@/redux/store/store";

export function selectLoggedInUserUid(state: RootState) {
    return state.auth.user?.uid;
}
