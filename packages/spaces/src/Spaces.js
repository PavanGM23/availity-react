/* eslint-disable unicorn/prefer-spread */
import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import { avWebQLApi } from '@availity/api-axios';
import { useEffectAsync } from '@availity/hooks';

import { spacesReducer, INITIAL_STATE, sanitizeSpaces, isFunction } from './helpers';

export const getAllSpaces = async (query, clientId, variables, _spaces = []) => {
  if (!clientId) {
    throw new Error('clientId is required');
  }

  const {
    data: {
      data: { configurationPagination },
    },
  } = await avWebQLApi.create(
    {
      query,
      variables,
    },
    { headers: { 'X-Client-ID': clientId } }
  );

  const {
    pageInfo: { itemCount, currentPage, perPage },
    items,
  } = configurationPagination;

  const unionedSpaces = _spaces.concat(items);

  // TODO explore using pageInfo.hasNextPage instead
  if (itemCount > currentPage * perPage) {
    const vars = { ...variables, page: currentPage + 1 };
    return getAllSpaces(query, clientId, vars, unionedSpaces);
  }

  return unionedSpaces;
};

export const SpacesContext = createContext();

export const useSpacesContext = () => useContext(SpacesContext);

const Spaces = ({ query, variables, clientId, spaceIds, payerIds, children, spaces: spacesFromProps }) => {
  const [{ spaces, loading, error }, dispatch] = useReducer(spacesReducer, INITIAL_STATE);

  // NOTE: we do not want to query webQL by payerIDs and spaceIDs at the same time
  // because webQL does an AND on those conditions. We want OR
  useEffectAsync(async () => {
    try {
      dispatch({
        type: 'LOADING',
        loading: true,
      });
      // Filter out dupes and ids that we already have the space for
      const filteredSpaceIDs = spaceIds
        .filter((id, i) => spaceIds.indexOf(id) === i)
        .filter((id) => !spaces.some((spc) => spc && (spc.id === id || spc.configurationId === id)))
        .filter((id) => !spacesFromProps.some((spc) => spc && (spc.id === id || spc.configurationId === id)));

      const filteredPayerIDs = payerIds
        .filter((id, i) => payerIds.indexOf(id) === i)
        .filter((id) => !spaces.some((spc) => spc && spc.payerIDs && spc.payerIDs.some((pId) => pId === id)))
        .filter((id) => !spacesFromProps.some((spc) => spc && spc.payerIDs && spc.payerIDs.some((pId) => pId === id)));

      if (filteredSpaceIDs.length === 0 && filteredPayerIDs.length === 0) {
        dispatch({
          type: 'LOADING',
          loading: false,
        });
        return;
      }

      let _spaces = [];
      if (filteredSpaceIDs.length > 0) {
        const vars = { ...variables, ids: filteredSpaceIDs };
        const spacesBySpaceIDs = await getAllSpaces(query, clientId, vars, spaces);
        _spaces = _spaces.concat(spacesBySpaceIDs);
      }

      if (filteredPayerIDs.length > 0) {
        const vars = { ...variables, payerIDs: filteredPayerIDs };
        const spacesByPayerIDs = await getAllSpaces(query, clientId, vars, spaces);
        _spaces = _spaces.concat(spacesByPayerIDs);
      }

      dispatch({
        type: 'SPACES',
        spaces: _spaces,
      });
    } catch (error_) {
      dispatch({
        type: 'ERROR',
        error: error_.message,
      });
    }
  }, [payerIds, spaceIds]);

  const spacesForProvider = sanitizeSpaces(spaces.concat(spacesFromProps));
  return (
    <SpacesContext.Provider value={{ spaces: spacesForProvider, loading, error }}>
      {isFunction(children) ? (() => children({ spaces: spacesForProvider, loading, error }))() : children}
    </SpacesContext.Provider>
  );
};

export const useSpaces = (...ids) => {
  const { spaces = [] } = useContext(SpacesContext) || {};

  const idsIsEmpty = !ids || ids.length === 0;
  const callerIsExpectingFirstSpace = ids && ids.length === 1 && ids[0] === undefined;

  if (callerIsExpectingFirstSpace && spaces.length > 1) {
    // eslint-disable-next-line no-console
    console.warn(
      `You did not pass an ID in to find a space, and there is more than 1 space in the space array. Returning all.`
    );
  }

  const shouldReturnAllSpaces = idsIsEmpty || callerIsExpectingFirstSpace;
  if (shouldReturnAllSpaces) {
    return spaces;
  }

  // Try to match by space id first, else match by payer id
  const filteredSpaces = ids.map((id) => {
    let [spc] = spaces.filter((s) => s.id === id || s.configurationId === id);

    if (!spc) {
      [spc] = spaces.filter((s) => {
        if (s.payerIDs && s.payerIDs.length > 0) return s.payerIDs[0] === id;
        return false;
      });
    }

    if (!spc) {
      [spc] = spaces.filter((s) => (s.payerIDs || []).some((p) => p === id));
    }
    return spc;
  });

  return filteredSpaces;
};

Spaces.propTypes = {
  clientId: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  query: PropTypes.string,
  variables: PropTypes.object,
  spaceIds: PropTypes.arrayOf(PropTypes.string),
  payerIds: PropTypes.arrayOf(PropTypes.string),
  spaces: PropTypes.arrayOf(PropTypes.object),
};

Spaces.defaultProps = {
  query: `
    query configurationFindMany($ids: [String!], $payerIDs: [ID!], $types: [TypeEnum!]){
      configurationPagination(filter: { ids: $ids, payerIds: $payerIDs, types: $types }){
        pageInfo{
          pageCount
          currentPage
          perPage
          itemCount
        }
        items {
          ...on Configuration{
              configurationId
              name
              description
              payerIDs
              parentIDs
              metadataPairs{
                name
                value
              }
          }
          
          ... on Node {
            id
          }
          
          ... on Alert {
            link{
              url
            }

          }
          
          ... on Container {
            link{
              url
            }
            images{
              tile
              promotional
              logo
              billboard
            }
          }
          
          ... on PayerSpace {
            link{
              url
            }
            images{
              tile
              logo
              billboard
            }
            url
          }
          
          ... on Application {
            link{
              url
            }
          }
          
          ... on Resource {
            link{
              url
            }
          }
          
          ... on Navigation {
            images{
              promotional
            }
          }
          
          ... on Learning {
            images {
              promotional
            }
          }
          
          ... on Proxy {
            url
          }
          
          ... on File {
            url
          }

        }
      }
    }
  `,
  variables: { types: ['PAYERSPACE'] },
  spaceIds: [],
  payerIds: [],
  spaces: [],
};

export default Spaces;
