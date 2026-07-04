import { ReactElement } from "react";
import { EditCrawlPresenter } from "@/presenters/editCrawlPresenter";

export default function NewCrawlPage(): ReactElement {
    return <EditCrawlPresenter mode="new"/>;
}

