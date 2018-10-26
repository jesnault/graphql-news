import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Header from '../components/Header';
import Feed from '../components/Feed';

const RecentLinks = ({ data: { allLinks } }) => (
  <div className="screen-wrapper flex-direction-column">
    <Header />
    <Feed links={allLinks} />
  </div>
);

RecentLinks.propTypes = {
  data: PropTypes.object.isRequired,
};

export default graphql(gql`
  query AllLinksForHomepage {
    allLinks(first: 10, skip: 0) {
      _id
      url
      description
      score
      comments {
        _id
      }
    }
  }
`)(RecentLinks);