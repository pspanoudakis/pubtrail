import type { FirestoreDocumentReferencePath } from "@/redux/types/crawlTypes";

export type FirestoreUserDoc = {
    email: string;
    avatarUrl: string;
    activeCrawl?: FirestoreDocumentReferencePath | null;
};

export type ThisUserEntity = {
    id: string;
    email: string;
    avatarUrl: string;
    activeCrawl?: FirestoreDocumentReferencePath | null;
};
