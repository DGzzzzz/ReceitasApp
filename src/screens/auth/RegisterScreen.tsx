import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ErrorModal } from '../../components/ErrorModal';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Nome precisa ter ao menos 2 caracteres';
    if (!email.trim()) e.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password || password.length < 6) e.password = 'Senha precisa ter ao menos 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas devem ser iguais';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, name.trim());
      setSuccessModal(true);
    } catch (e: any) {
      setErrorModal({ title: 'Erro ao criar conta', message: 'Tente novamente' });
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
      <ErrorModal
        visible={successModal}
        type="success"
        title="Conta criada!"
        message="Verifique seu e-mail para confirmar o cadastro."
        onClose={() => {
          setSuccessModal(false);
          navigation.navigate('Login');
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-16 pb-10">
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              Criar conta
            </Text>
            <Text className="text-gray-500 mb-8">
              Cadastre-se para salvar suas receitas
            </Text>

            <Input
              label="Nome completo"
              placeholder="Seu nome"
              autoCapitalize="words"
              autoComplete="name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

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
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Input
              label="Confirmar senha"
              placeholder="Repita a senha"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <Button
              label="Criar conta"
              onPress={handleRegister}
              loading={loading}
              className="mt-2"
            />

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-gray-500">Já tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-primary-500 font-semibold">Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
