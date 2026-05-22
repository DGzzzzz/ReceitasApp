import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RecipesStackParamList = {
  RecipeList: undefined;
  RecipeDetail: {recipeId: string};
  CreateRecipe: undefined;
  EditRecipe: {recipeId: string};
};

export type CommunityStackParamList = {
  Community: undefined;
  UserPublicProfile: {userId: string; userName: string};
  PublicRecipeDetail: {recipeId: string; authorName: string; authorId: string};
};

export type AppTabParamList = {
  RecipesTab: NavigatorScreenParams<RecipesStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};
