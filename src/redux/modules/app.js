/*
Copyright 2017 Globo.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import _ from 'lodash';
import { sortByName, getEdgeLinks } from '../../utils';

const SOCKET = 'socket';

const FETCH_GRAPHS = 'fetch_graphs';
const FETCH_GRAPHS_SUCCESS = 'fetch_graphs_success';
const FETCH_GRAPHS_FAIL = 'fetch_graphs_fail';

const FETCH_COLLECTIONS = 'fetch_collections';
const FETCH_COLLECTIONS_SUCCESS = 'fetch_collections_success';
const FETCH_COLLECTIONS_FAIL = 'fetch_collections_fail';

const GET_ENV = 'get_env';
const GET_ENV_SUCCESS = 'get_env_success';
const GET_ENV_FAIL = 'get_env_fail';

const TOGGLE_GRAPH = 'toggle_graph';
const TOGGLE_HASID = 'toggle_hasid';
const SHOW_MODAL = 'show_modal';
const CLOSE_MODAL = 'close_modal';

const initialState = {
  graphs: [],
  collections: [],
  collectionsByGraphs: {},
  enabledCollections: [],
  selectedCollections: [],
  environ: '',
  hasId: false,
  modalVisible: false,
  modalContent: null
};

export default function reducer(state=initialState, action={}) {
  switch (action.type) {
    case FETCH_GRAPHS:
      console.log('fetch graphs...');
      return state;

    case FETCH_GRAPHS_SUCCESS:
      let graphs = sortByName(action.result);
      let collectionsByGraphs = {};
      let enabledCollections = [];

      graphs.forEach((graph, index) => {
        let colls = getEdgeLinks(graph);

        graphs[index].colorClass = 'graph-color-' + index;
        graphs[index].enabled = false;

        enabledCollections = enabledCollections.concat(colls);
        collectionsByGraphs[graph.name] = _.uniq(colls);
      });

      return {
        ...state,
        graphs,
        collectionsByGraphs,
        enabledCollections
      };

    case FETCH_GRAPHS_FAIL:
      console.log(action.error);
      return {
        ...state,
        error: action.error
      };

    case FETCH_COLLECTIONS:
      console.log('fetch collections...');
      return state;

    case FETCH_COLLECTIONS_SUCCESS:
      return {
        ...state,
        collections: action.result
      };

    case FETCH_COLLECTIONS_FAIL:
      console.log(action.error);
      return {
        ...state,
        error: action.error
      };

    case GET_ENV:
      console.log('get environ...');
      return state;

    case GET_ENV_SUCCESS:
      return {
        ...state,
        environ: action.result
      };

    case GET_ENV_FAIL:
      console.log(action.error);
      return {
        ...state,
        error: action.error
      };

    case TOGGLE_GRAPH:
      const newGraphs = state.graphs.map((graph) => {
        if(graph.name === action.name) {
          graph.enabled = !graph.enabled;
        }
        return graph;
      });

      let selectedCollections = [];
      newGraphs.forEach((graph, index) => {
        if (graph.enabled) {
          selectedCollections = selectedCollections.concat(getEdgeLinks(graph));
        }
      });

      return {
        ...state,
        graphs: newGraphs,
        selectedCollections: _.uniq(selectedCollections)
      };

    case TOGGLE_HASID:
      return {
        ...state,
        hasId: !state.hasId
      };

    case SHOW_MODAL:
      return {
        ...state,
        modalVisible: true,
        modalContent: action.content
      }

    case CLOSE_MODAL:
      return {
        ...state,
        modalVisible: false,
        modalContent: null
      }

    default:
      return state;
  }
}

export function fetchGraphs() {
  return {
    type: SOCKET,
    types: [FETCH_GRAPHS, FETCH_GRAPHS_SUCCESS, FETCH_GRAPHS_FAIL],
    promise: (socket) => socket.emit('getgraphs', {})
  };
}

export function fetchCollections() {
  return {
    type: SOCKET,
    types: [FETCH_COLLECTIONS, FETCH_COLLECTIONS_SUCCESS, FETCH_COLLECTIONS_FAIL],
    promise: (socket) => socket.emit('getcollections', {})
  };
}

export function getEnviron() {
  return {
    type: SOCKET,
    types: [GET_ENV, GET_ENV_SUCCESS, GET_ENV_FAIL],
    promise: (socket) => socket.emit('getenviron', {})
  };
}

export function toggleGraph(name) {
  return {
    type: TOGGLE_GRAPH,
    name
  };
}

export function toggleHasId() {
  return {
    type: TOGGLE_HASID
  };
}

export function showModal(content) {
  return {
    type: SHOW_MODAL,
    content
  }
}

export function closeModal() {
  return {
    type: CLOSE_MODAL
  }
}

