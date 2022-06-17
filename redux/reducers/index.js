import { combineReducers } from "redux";
import * as t from "../types";
import position from "./position";

const initialState = {
  name: "",
};

const main = (state = initialState, action) => {
  switch (action.type) {
    case t.SET_NAME:
      return {
        ...state,
        name: action.payload,
      };
    default:
      return { ...state };
  }
};

const rootReducer = combineReducers({
  main: main,
  position: position,
});

export default rootReducer;
