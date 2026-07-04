import authReducer from './authReducer';
import mapReducer from './mapReducer';
import weatherReducer from './weatherReducer';
import activeCrawlReducer from './activeCrawlReducer';
import newCrawlDraftReducer from './newCrawlDraftReducer';
import stopEditorReducer from './stopEditorReducer';
import nearbyCrawlsReducer from './nearbyCrawlsReducer';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    auth: authReducer,
    map: mapReducer,
    weather: weatherReducer,
    activeCrawl: activeCrawlReducer,
    newCrawlDraft: newCrawlDraftReducer,
    stopEditor: stopEditorReducer,
    nearbyCrawls: nearbyCrawlsReducer,
});

export default rootReducer;