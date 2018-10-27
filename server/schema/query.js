import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';
import { ObjectId } from 'mongodb';

import LinkType from './types/link';
import UserType from './types/user';
import CommentType from './types/comment';

const LinkFilter = new GraphQLInputObjectType({
  name: 'LinkFilter',
  fields: () => ({
    top: { type: GraphQLInt },
    urlContains: { type: GraphQLString },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allLinks: {
      type: new GraphQLList(LinkType),
      args: {
        first: { type: GraphQLInt },
        skip: { type: GraphQLInt },
      },
      resolve: async (_, { first, skip }, { db: { Links } }) => {
        if (first && !skip) {
          return await Links.find({})
            .limit(first)
            .toArray();
        } else if (skip && !first) {
          return await Links.find({})
            .skip(skip)
            .toArray();
        } else if (skip && first) {
          return await Links.find({})
            .limit(first)
            .skip(skip)
            .toArray();
        }

        return await Links.find({}).toArray();
      },
    },
    link: {
      type: LinkType,
      args: {
        // We must know a link's ID in order to query for it
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { _id }, { db: { Links } }) => await Links.findOne(ObjectId(_id)),
    },
    filterLinks: {
      type: new GraphQLList(LinkType),
      args: {
        filter: { type: LinkFilter },
      },
      resolve: async (_, { filter }, { db: { Links } }) => {
        const { urlContains, top } = filter;

        if (urlContains) {
          return await Links.find({ url: { $regex: `.*${urlContains}.*` } }).toArray();
        }

        if (top) {
          const linksArr = await Links.find({}).toArray();

          const compareScore = (a, b) => {
            if (a.score > b.score) {
              return -1;
            }
            if (a.score < b.score) {
              return 1;
            }
            return 0;
          };

          return linksArr.sort(compareScore).slice(0, top);
        }

        return null;
      },
    },
    allUsers: {
      type: new GraphQLList(UserType),
      resolve: async (_, data, { db: { Users } }) => await Users.find({}).toArray(),
    },
    user: {
      type: UserType,
      args: {
        // We must know a user's ID in order to query for him/her
        _id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { _id }, { db: { Users } }) => await Users.findOne(ObjectId(_id)),
    },
    allComments: {
      type: new GraphQLList(CommentType),
      resolve: async (_, data, { db: { Comments } }) => await Comments.find({}).toArray(),
    },
  }),
});

export default QueryType;