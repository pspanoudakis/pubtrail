import type { RootState } from "@/redux/store/store";

export function selectStopEditor(state: RootState) {
    return state.stopEditor;
}



