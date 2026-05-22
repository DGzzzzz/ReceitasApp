import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../contexts/AuthContext';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {updateProfile} from '../../services/authService';
import {ErrorModal} from '../../components/ErrorModal';
import {ConfirmModal} from '../../components/ConfirmModal';

export function ProfileScreen() {
  const {user, profile, logout, refreshProfile} = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorModal, setErrorModal] = useState<{title: string; message: string} | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {full_name: name.trim()});
      await refreshProfile();
      setEditing(false);
    } catch (e: any) {
      setErrorModal({title: 'Erro', message: e.message ?? 'Não foi possível salvar'});
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => setLogoutConfirm(true);

  const confirmLogout = async () => {
    setLogoutConfirm(false);
    setLoggingOut(true);
    try {
      await logout();
    } catch (e: any) {
      setErrorModal({title: 'Erro', message: e.message});
      setLoggingOut(false);
    }
  };

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
    <ErrorModal
      visible={!!errorModal}
      title={errorModal?.title ?? ''}
      message={errorModal?.message ?? ''}
      onClose={() => setErrorModal(null)}
    />
    <ConfirmModal
      visible={logoutConfirm}
      title="Sair da conta"
      message="Deseja sair da sua conta?"
      confirmLabel="Sair"
      destructive
      onConfirm={confirmLogout}
      onCancel={() => setLogoutConfirm(false)}
    />
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{padding: 24}}>
        <Text className="text-2xl font-bold text-gray-900 mb-8">Perfil</Text>

        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">{initials}</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-900">
            {profile?.full_name ?? 'Usuário'}
          </Text>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
        </View>

        <View className="bg-gray-50 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-semibold text-gray-900">
              Informações
            </Text>
            {!editing && (
              <TouchableOpacity
                onPress={() => {
                  setName(profile?.full_name ?? '');
                  setEditing(true);
                }}>
                <Text className="text-primary-500 font-medium">Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              <Input
                label="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <View className="flex-row gap-3">
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setEditing(false)}
                  className="flex-1"
                  fullWidth={false}
                />
                <Button
                  label="Salvar"
                  onPress={handleSave}
                  loading={saving}
                  className="flex-1"
                  fullWidth={false}
                />
              </View>
            </>
          ) : (
            <View>
              <View className="py-3 border-b border-gray-200">
                <Text className="text-xs text-gray-400 mb-1">Nome</Text>
                <Text className="text-gray-800">
                  {profile?.full_name ?? 'Não informado'}
                </Text>
              </View>
              <View className="py-3">
                <Text className="text-xs text-gray-400 mb-1">E-mail</Text>
                <Text className="text-gray-800">{user?.email}</Text>
              </View>
            </View>
          )}
        </View>

        <Button
          label={loggingOut ? 'Saindo...' : 'Sair da conta'}
          variant="danger"
          onPress={handleLogout}
          loading={loggingOut}
        />
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
