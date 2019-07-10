/*
Copyright 2019 Globo.com

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
import { composeEdges, traversalToStage } from '../../utils';
import { setStageNodes } from './stage';
import { setTab } from './tabs';

const AUTOMAP_FIND_NODES = 'automap_find_nodes';
const AUTOMAP_FIND_NODES_SUCCESS = 'automap_find_nodes_success';
const AUTOMAP_FIND_NODES_FAIL = 'automap_find_nodes_fail';

const DNSLOOKUP_AUTOMAP_FIND_NODES = 'dnslookup_automap_find_nodes';
const DNSLOOKUP_AUTOMAP_FIND_NODES_SUCCESS = 'dnslookup_automap_find_nodes_success';
const DNSLOOKUP_AUTOMAP_FIND_NODES_FAIL = 'dnslookup_automap_find_nodes_fail';

const AUTOMAP_RENAME_NODES = 'automap_rename_nodes';

const AUTOMAP_TRAVERSAL = 'automap_traversal';
const AUTOMAP_TRAVERSAL_SUCCESS = 'automap_traversal_success';
const AUTOMAP_TRAVERSAL_FAIL = 'automap_traversal_fail';

const AUTOMAP_RESET_NODES = 'automap_reset_nodes';
const AUTOMAP_RESET_SUBNODES = 'automap_reset_subnodes';

const initialState = {
  automapNodeList: [],
  automapSubNodesList: [],
  automapFindLoading: false,
  automapTraversalLoading: false
};

export default function reducer(state=initialState, action={}) {
  let result, data;

  switch (action.type) {
    case AUTOMAP_FIND_NODES:
      console.log('automap find nodes...');
      return {
        ...state,
        automapFindLoading: true
      };

    case AUTOMAP_FIND_NODES_SUCCESS:
      result = action.result;
      data = result.data;

      return {
        ...state,
        automapNodeList: data.documents,
        automapFindLoading: false
      };

    case AUTOMAP_FIND_NODES_FAIL:
      console.log(action.error);
      return {
        ...state,
        automapNodeList: [],
        automapFindLoading: false,
        error: action.error
      };

    case DNSLOOKUP_AUTOMAP_FIND_NODES:
      console.log('automap find nodes...');
      return {
        ...state,
        automapFindLoading: true
      };

    case DNSLOOKUP_AUTOMAP_FIND_NODES_SUCCESS:
      result = action.result;
      data = result.data;

      return {
        ...state,
        automapNodeList: data.documents,
        automapFindLoading: false
      };

    case DNSLOOKUP_AUTOMAP_FIND_NODES_FAIL:
      console.log(action.error);
      return {
        ...state,
        automapNodeList: [],
        automapFindLoading: false,
        error: action.error
      };

    case AUTOMAP_RENAME_NODES:
      let data = action.data;
      let currentNodes = state.automapNodeList.slice();

      currentNodes.map((d) => {
        d.name = data;
        return d;
      });

      return {
        ...state,
        automapNodeList: currentNodes
      };

    case AUTOMAP_TRAVERSAL:
      console.log('automap traversal search...');
      return {
        ...state,
        automapTraversalLoading: true
      }

    case AUTOMAP_TRAVERSAL_SUCCESS:
      data = action.result.data;

      const byGraphData = data.map(gData => {
        gData.subnodes = gData.nodes.filter(n => n._id !== action.node._id).map(n => {
          n.edges = composeEdges(n, gData.edges);
          n.edges.graph = gData.graph;
          return n;
        });
        return gData;
      });

      return {
        ...state,
        automapTraversalLoading: false,
        automapSubNodesList: byGraphData
      }

    case AUTOMAP_TRAVERSAL_FAIL:
      console.log(action.error);
      return {
        ...state,
        automapTraversalLoading: false,
        automapSubNodesList: []
      }

    case AUTOMAP_RESET_NODES:
      return {
        ...state,
        automapNodeList: []
      }

    case AUTOMAP_RESET_SUBNODES:
      return {
        ...state,
        automapSubNodesList: []
      }

    default:
      return state;
  }
}

export function automapFindNodes(opts) {
  const options = _.merge({
    query: '',
    queryProps: [],
    collections: [],
    per_page: null,
    page: 1
  }, opts);

  return {
    types: [AUTOMAP_FIND_NODES, AUTOMAP_FIND_NODES_SUCCESS, AUTOMAP_FIND_NODES_FAIL],
    promise: (client) => client.get('/api/find-nodes', options),
    options
  };
}

export function dnsLookupAutomapFindNodes(opts) {
  const options = _.merge({
    query: '',
    queryProps: [],
    collections: [],
    per_page: null,
    page: 1
  }, opts);

  return {
    types: [DNSLOOKUP_AUTOMAP_FIND_NODES, DNSLOOKUP_AUTOMAP_FIND_NODES_SUCCESS, DNSLOOKUP_AUTOMAP_FIND_NODES_FAIL],
    promise: (client) => client.get('/api/dnslookup-find-nodes', options),
    options
  };
}

export function automapRenameNodes(txt) {
  return {
    type: AUTOMAP_RENAME_NODES,
    data: txt
  };
}

export function dnsLookupAutomapFindNodesAndRename(opts, txt) {
  return (dispatch, getState) => {
    return dispatch(dnsLookupAutomapFindNodes(opts)).then(
      () => {
        dispatch(automapRenameNodes(txt));
      }
    );
  }
}

export function automapTraversalSearch(opts) {
  const options = _.merge({
    node: null,
    graphs: [],
    depth: 1
  }, opts);

  return {
    types: [AUTOMAP_TRAVERSAL, AUTOMAP_TRAVERSAL_SUCCESS, AUTOMAP_TRAVERSAL_FAIL],
    promise: (client) => client.post('/api/traversal-search', options),
    graphs: options.graphs,
    node: options.node
  }
}

export function automapTraversal(opts) {
  return (dispatch, getState) => {
    return dispatch(automapTraversalSearch(opts)).then(() => {
      const newMap = traversalToStage(getState().automap.automapSubNodesList, 'type');
      dispatch(setStageNodes(newMap));
      dispatch(setTab('map'));
    });
  }
}

export function automapResetNodes() {
  return {
    type: AUTOMAP_RESET_NODES
  }
}

export function automapResetSubNodes() {
  return {
    type: AUTOMAP_RESET_SUBNODES
  }
}
