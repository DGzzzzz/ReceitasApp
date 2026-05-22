# ReceitasApp — Guia de Setup

## 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute todo o conteúdo de `supabase/schema.sql`
3. Copie a **URL** e a **anon key** em **Settings > API**

## 2. Configurar credenciais

Edite `src/services/supabase.ts` e substitua:

```ts
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key';
```

## 3. Instalar dependências

```bash
cd ReceitasApp
npm install
```

## 4. iOS (macOS)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## 5. Android

Em `android/app/build.gradle`, adicione antes do `dependencies {}`:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

Em `android/app/src/main/AndroidManifest.xml`, adicione as permissões:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
  android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
  android:maxSdkVersion="29" />
<uses-permission android:name="android.permission.INTERNET" />
```

```bash
npx react-native run-android
```

## 6. iOS — Info.plist

Adicione em `ios/ReceitasApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Permite tirar foto para sua receita</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Permite escolher foto da galeria para sua receita</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Permite salvar fotos das suas receitas</string>
```

## Arquitetura

```
ReceitasApp/
├── App.tsx                        # Entry point
├── index.js                       # AppRegistry
├── global.css                     # NativeWind CSS
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── supabase/
│   └── schema.sql                 # Execute no Supabase
└── src/
    ├── types/
    │   ├── index.ts               # Interfaces e tipos
    │   └── navigation.ts          # Tipos das rotas
    ├── services/
    │   ├── supabase.ts            # Cliente Supabase
    │   ├── authService.ts         # Auth: signIn/signUp/signOut
    │   ├── recipeService.ts       # CRUD de receitas
    │   └── storageService.ts      # Upload de fotos
    ├── contexts/
    │   └── AuthContext.tsx        # Contexto de autenticação
    ├── hooks/
    │   ├── useRecipes.ts          # Estado e operações de receitas
    │   └── useImagePicker.ts      # Câmera e galeria
    ├── components/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── RecipeCard.tsx
    │   ├── IngredientRow.tsx
    │   ├── IngredientList.tsx
    │   ├── PhotoPicker.tsx
    │   └── EmptyState.tsx
    ├── navigation/
    │   ├── RootNavigator.tsx      # Auth vs App
    │   ├── AuthNavigator.tsx      # Login / Register
    │   └── AppNavigator.tsx       # Bottom Tabs + RecipesStack
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx
        │   └── RegisterScreen.tsx
        └── app/
            ├── RecipeListScreen.tsx
            ├── RecipeDetailScreen.tsx
            ├── CreateRecipeScreen.tsx
            ├── EditRecipeScreen.tsx
            └── ProfileScreen.tsx
```
