import { doc, getDoc, setDoc, type DocumentData } from "firebase/firestore";
import type { FirestoreUserDoc } from "@/redux/types/userTypes";
import { getDb, isDocumentReference, type FirestoreDocRecord } from "./firestoreGatewayUtils";

function toReferencePath(value: unknown): string | null {
    if (typeof value === "string") {
        return value;
    }

    if (isDocumentReference(value)) {
        return `/${value.path}`;
    }

    return null;
}

function toUserDoc(data: DocumentData): FirestoreUserDoc {
    return {
        email: typeof data.email === "string" ? data.email : "",
        avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : "",
        activeCrawl: toReferencePath(data.activeCrawl),
    };
}

export async function fetchUserById(
    userId: string
): Promise<FirestoreDocRecord<FirestoreUserDoc> | null> {
    if (!userId) {
        return null;
    }

    const db = getDb();
    const userSnapshot = await getDoc(doc(db, "users", userId));

    if (!userSnapshot.exists()) {
        return null;
    }

    return {
        id: userSnapshot.id,
        data: toUserDoc(userSnapshot.data()),
    };
}

export async function ensureDocForUser(
    userId: string,
    email: string,
    avatarUrl = ""
): Promise<FirestoreDocRecord<FirestoreUserDoc> | null> {
    if (!userId) {
        return null;
    }

    const db = getDb();
    const userRef = doc(db, "users", userId);

    const userDoc: FirestoreUserDoc = {
        email,
        avatarUrl,
    };

    await setDoc(userRef, userDoc, { merge: true });

    return {
        id: userId,
        data: userDoc,
    };
}
