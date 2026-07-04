export type Visitable = {
    visitedOn: number;
};

export function sortStopsChronologically(a: Visitable, b: Visitable): number {
    return a.visitedOn - b.visitedOn;
}
