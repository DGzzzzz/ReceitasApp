import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../types/navigation';
import {useAuth} from '../../contexts/AuthContext';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {ErrorModal} from '../../components/ErrorModal';
import {Icon} from '../../components/Icon';

const STORAGE_KEY = '@login_credentials';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({navigation}: Props) {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [errorModal, setErrorModal] = useState<{title: string; message: string} | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        setEmail(saved.email ?? '');
        setRememberMe(true);
      } catch {}
    });
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({email: email.trim().toLowerCase()}),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setErrorModal({title: 'Erro ao entrar', message: 'Verifique suas credenciais'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorModal
        visible={!!errorModal}
        title={errorModal?.title ?? ''}
        message={errorModal?.message ?? ''}
        onClose={() => setErrorModal(null)}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-20 pb-10 justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <Icon name="hat-chef" size={36} color="#f97316" />
                <Text className="text-4xl font-bold text-primary-500">Panelinha</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                Bem-vindo de volta!
              </Text>
              <Text className="text-gray-500 mb-10">
                Entre para acessar suas receitas
              </Text>

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <Input
                label="Senha"
                placeholder="Sua senha"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />

              <TouchableOpacity
                onPress={() => setRememberMe(v => !v)}
                className="flex-row items-center gap-2.5 mt-1 mb-4"
                activeOpacity={0.7}>
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    rememberMe
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-300'
                  }`}>
                  {rememberMe && <Icon name="check" size={11} color="#fff" />}
                </View>
                <Text className="text-sm text-gray-600">Lembrar de mim</Text>
              </TouchableOpacity>

              <Button
                label="Entrar"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            <View className="flex-row items-center justify-center mt-8">
              <Text className="text-gray-500">Não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-500 font-semibold">Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
