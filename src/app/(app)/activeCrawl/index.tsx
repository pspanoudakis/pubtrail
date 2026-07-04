import { ReactElement } from "react";
import { EditCrawlPresenter } from "@/presenters/editCrawlPresenter";

export default function ActiveCrawlPage(): ReactElement {
    return <EditCrawlPresenter mode="active" />;
}
