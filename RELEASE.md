# Guia de Release — ReceitasApp

Passos completos para gerar um APK/AAB de release assinado e publicar uma release no GitHub.

---

## 1. Segurança — checklist antes de qualquer commit

- [ ] `.env` **não está** rastreado pelo git (`git status` não deve listá-lo)
- [ ] `android/keystore.properties` **não está** rastreado pelo git
- [ ] `*.jks` / `*.keystore` (exceto `debug.keystore`) **não estão** no repositório
- [ ] Nenhuma chave de API hardcoded no código-fonte

### Verificar se `.env` já foi commitado

```bash
git log --all --full-history -- .env
```

Se retornar commits, remova do histórico:

```bash
# Instalar BFG Repo-Cleaner (recomendado sobre git filter-branch)
# https://rtyley.github.io/bfg-repo-cleaner/

java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

> ⚠ Após remover do histórico, **revogue e regenere** as chaves no painel do Supabase
> (Settings → API → Regenerate anon key).

---

## 2. Gerar a Keystore de Release

Execute **uma única vez**. Guarde o arquivo `.jks` e as senhas em local seguro (gerenciador de senhas).

```bash
keytool -genkeypair -v \
  -keystore android/app/receitasapp-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias receitasapp \
  -dname "CN=ReceitasApp, OU=Mobile, O=SuaOrg, L=SuaCidade, ST=SP, C=BR"
```

Você será solicitado a definir:
- **keystore password** — senha do arquivo `.jks`
- **key password** — senha da chave `receitasapp`

> ⚠ Nunca commite o arquivo `.jks`. Ele já está coberto por `*.keystore` / `*.jks` no `.gitignore`.

---

## 3. Configurar `android/keystore.properties`

Crie o arquivo `android/keystore.properties` (ele está no `.gitignore` e não será commitado):

```properties
storeFile=receitasapp-release.jks
storePassword=SUA_SENHA_DO_KEYSTORE
keyAlias=receitasapp
keyPassword=SUA_SENHA_DA_CHAVE
```

> O caminho em `storeFile` é relativo a `android/app/`. Coloque o `.jks` dentro de `android/app/`.

---

## 4. Atualizar a versão do app

Antes de cada release, incremente `versionCode` e `versionName` em `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2          // incrementar a cada release (inteiro, usado pela Play Store)
    versionName "1.1.0"    // string visível ao usuário (semver)
}
```

---

## 5. Gerar o bundle de release (AAB — recomendado para Play Store)

```bash
cd android
./gradlew bundleRelease
```

O arquivo gerado estará em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Alternativa: APK de release (para distribuição direta)

```bash
cd android
./gradlew assembleRelease
```

O arquivo gerado estará em:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 6. Verificar a assinatura

```bash
# Para APK
apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk

# Para AAB (requer bundletool)
java -jar bundletool.jar validate --bundle=android/app/build/outputs/bundle/release/app-release.aab
```

---

## 7. Criar tag e commit de release no Git

```bash
# Certifique-se de que tudo está commitado
git status

# Criar tag anotada com a versão
git tag -a v1.0.0 -m "Release v1.0.0"

# Enviar a tag para o GitHub
git push origin main
git push origin v1.0.0
```

---

## 8. Publicar a Release no GitHub

### Via GitHub CLI (recomendado)

```bash
gh release create v1.0.0 \
  android/app/build/outputs/apk/release/app-release.apk \
  --title "v1.0.0" \
  --notes "## O que há de novo

- Funcionalidade de comunidade: busca de receitas e usuários
- Copiar receitas de outros usuários
- Receitas públicas e privadas
- Campo de busca nas listas de receitas
- Checkbox 'Lembrar de mim' no login

## Download

Baixe o APK abaixo e instale manualmente no seu dispositivo Android."
```

### Via interface web do GitHub

1. Acesse `github.com/SEU_USUARIO/ReceitasApp/releases`
2. Clique em **Draft a new release**
3. Em **Choose a tag**, selecione a tag `v1.0.0` criada no passo anterior
4. Preencha o título: `v1.0.0`
5. Escreva as notas de release (changelog)
6. Faça upload do arquivo `app-release.apk` em **Attach binaries**
7. Clique em **Publish release**

---

## 9. Checklist final antes de publicar

- [ ] `versionCode` e `versionName` atualizados em `build.gradle`
- [ ] Build gerado com sucesso sem erros
- [ ] APK/AAB assinado com a keystore de **release** (não debug)
- [ ] App testado no build de release (comportamento pode diferir do debug)
- [ ] Tag criada e enviada ao GitHub
- [ ] `.env` e `keystore.properties` **não presentes** no commit

---

## Referências rápidas

| Comando | Descrição |
|---------|-----------|
| `./gradlew assembleRelease` | Gera APK assinado |
| `./gradlew bundleRelease` | Gera AAB assinado (Play Store) |
| `./gradlew clean` | Limpa build anterior antes de recompilar |
| `git tag -a vX.Y.Z -m "..."` | Cria tag de release |
| `git push origin vX.Y.Z` | Envia tag ao GitHub |
| `gh release create vX.Y.Z ...` | Cria release via CLI |
