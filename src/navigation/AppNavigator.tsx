import React from 'react';
import {View, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon, IconName} from '../components/Icon';
import {
  AppTabParamList,
  RecipesStackParamList,
  CommunityStackParamList,
} from '../types/navigation';
import {RecipeListScreen} from '../screens/app/RecipeListScreen';
import {RecipeDetailScreen} from '../screens/app/RecipeDetailScreen';
import {CreateRecipeScreen} from '../screens/app/CreateRecipeScreen';
import {EditRecipeScreen} from '../screens/app/EditRecipeScreen';
import {ProfileScreen} from '../screens/app/ProfileScreen';
import {CommunityScreen} from '../screens/community/CommunityScreen';
import {UserPublicProfileScreen} from '../screens/community/UserPublicProfileScreen';
import {PublicRecipeDetailScreen} from '../screens/community/PublicRecipeDetailScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const RecipesStack = createNativeStackNavigator<RecipesStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

const HEADER_OPTIONS = {
  headerStyle: {backgroundColor: '#f97316'},
  headerTintColor: '#fff',
  headerTitleStyle: {fontWeight: 'bold' as const},
};

function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator screenOptions={HEADER_OPTIONS}>
      <RecipesStack.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{title: 'Minhas Receitas'}}
      />
      <RecipesStack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{title: 'Receita'}}
      />
      <RecipesStack.Screen
        name="CreateRecipe"
        component={CreateRecipeScreen}
        options={{title: 'Nova Receita'}}
      />
      <RecipesStack.Screen
        name="EditRecipe"
        component={EditRecipeScreen}
        options={{title: 'Editar Receita'}}
      />
    </RecipesStack.Navigator>
  );
}

function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={HEADER_OPTIONS}>
      <CommunityStack.Screen
        name="Community"
        component={CommunityScreen}
        options={{title: 'Comunidade'}}
      />
      <CommunityStack.Screen
        name="UserPublicProfile"
        component={UserPublicProfileScreen}
        options={({route}) => ({title: route.params.userName})}
      />
      <CommunityStack.Screen
        name="PublicRecipeDetail"
        component={PublicRecipeDetailScreen}
        options={{title: 'Receita'}}
      />
    </CommunityStack.Navigator>
  );
}

const TAB_ICONS: Record<string, IconName> = {
  Receitas: 'restaurant',
  Comunidade: 'users',
  Perfil: 'user',
};

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  const color = focused ? '#f97316' : '#9ca3af';
  return (
    <View className="items-center">
      <Icon name={TAB_ICONS[label]} size={24} color={color} />
      <Text
        className={`text-xs mt-0.5 ${
          focused ? 'text-primary-500 font-semibold' : 'text-gray-400'
        }`}>
        {label}
      </Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: '#f3f4f6',
        },
      }}>
      <Tab.Screen
        name="RecipesTab"
        component={RecipesStackNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Receitas" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityStackNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Comunidade" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
