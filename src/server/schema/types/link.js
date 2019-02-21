import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import { ObjectId } from 'mongodb';

import UserType from './user';
import CommentType from './comment';

const LinkType = new GraphQLObjectType({
  name: 'Link',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    author: {
      type: UserType,
      args: {
        author: { type: GraphQLID },
      },
      resolve: async ({ author }, data, { db: { Users } }) =>
        await Users.findOne({ _id: ObjectId(author) }),
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve: async ({ _id }, data, { db: { Comments } }) =>
        await Comments.find({ link: ObjectId(_id) }).toArray(),
    },
    created_at: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    score: { type: GraphQLInt },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default LinkType;