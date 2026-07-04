import type { NewCrawlDraftState } from "@/redux/types/crawlTypes";
import type { GeoCoordinates } from "@/utils/geo";

const initialState: NewCrawlDraftState = {
    stops: [],
};

type NewCrawlDraftAction =
    | {
          type: "NEW_CRAWL_DRAFT_ADD_STOP";
          payload: {
              id: string;
              pubName: string;
              notes: string;
              coordinates: GeoCoordinates;
              visitedOn: number;
          };
      }
    | {
          type: "NEW_CRAWL_DRAFT_UPDATE_STOP";
          payload: {
              id: string;
              pubName: string;
              notes?: string;
              visitedOn?: number;
              coordinates?: GeoCoordinates;
          };
      }
    | { type: "NEW_CRAWL_DRAFT_CLEAR" };

const newCrawlDraftReducer = (
    state = initialState,
    action: NewCrawlDraftAction
): NewCrawlDraftState => {
    switch (action.type) {
        case "NEW_CRAWL_DRAFT_ADD_STOP":
            return {
                ...state,
                stops: [...state.stops, action.payload],
            };
        case "NEW_CRAWL_DRAFT_UPDATE_STOP":
            return {
                ...state,
                stops: state.stops.map((stop) =>
                    stop.id === action.payload.id
                        ? {
                              ...stop,
                              pubName: action.payload.pubName,
                              notes: action.payload.notes ?? stop.notes,
                              visitedOn: action.payload.visitedOn ?? stop.visitedOn,
                              ...(action.payload.coordinates ? { coordinates: action.payload.coordinates } : {}),
                          }
                        : stop
                ),
            };
        case "NEW_CRAWL_DRAFT_CLEAR":
            return initialState;
        default:
            return state;
    }
};

export default newCrawlDraftReducer;
