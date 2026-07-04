import { firebaseApp } from "@/firebaseConfig";
import {firebaseDatabaseId} from "@/firebaseEnv";
import { DocumentReference, getFirestore } from "firebase/firestore";

export type FirestoreDocRecord<T> = {
    id: string;
    data: T;
};

export function getDb() {
    return getFirestore(firebaseApp, firebaseDatabaseId);
}

export function isDocumentReference(value: unknown): value is DocumentReference {
    return Boolean(
        value &&
            typeof value === "object" &&
            "path" in value &&
            typeof (value as { path?: unknown }).path === "string"
    );
}
