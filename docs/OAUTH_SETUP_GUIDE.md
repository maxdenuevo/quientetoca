# 🔐 OAuth Setup Guide - Supabase

Instrucciones paso a paso para configurar Google y Microsoft OAuth en Supabase.

---

## 1️⃣ Google OAuth Setup

### Paso 1: Crear Google Cloud Project

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. Nombre sugerido: "quienteto-oauth"

### Paso 2: Configurar OAuth Consent Screen

1. En Google Cloud Console, ve a: **APIs & Services → OAuth consent screen**
2. Selecciona **External** (usuarios pueden ser cualquier cuenta Google)
3. Click **CREATE**
4. Completa el formulario:
   - **App name**: quienteto.ca
   - **User support email**: tu email
   - **Developer contact**: tu email
5. Click **SAVE AND CONTINUE**
6. En **Scopes**: No agregues nada, solo click **SAVE AND CONTINUE**
7. En **Test users**: Puedes agregar tu email para testing
8. Click **SAVE AND CONTINUE**

### Paso 3: Crear OAuth Credentials

1. Ve a: **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS → OAuth client ID**
3. Selecciona **Application type: Web application**
4. **Name**: "quienteto-web-client"
5. En **Authorized JavaScript origins**, agrega:
   ```
   https://ovduwudtkogevkaqulbo.supabase.co
   ```
6. En **Authorized redirect URIs**, agrega:
   ```
   https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback
   ```
7. Click **CREATE**
8. **COPIA** el **Client ID** y **Client Secret** que aparecen

### Paso 4: Configurar en Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard/project/ovduwudtkogevkaqulbo/auth/providers)
2. Busca **Google** en la lista de providers
3. Click para expandir
4. **Enable Sign in with Google**: Toggle ON ✅
5. Pega tus credenciales:
   - **Client ID (for OAuth)**: Pega el Client ID de Google Cloud
   - **Client Secret (for OAuth)**: Pega el Client Secret de Google Cloud
6. **Deja las demás opciones como están**:
   - ❌ Skip nonce checks: OFF
   - ❌ Allow users without email: OFF
7. Click **SAVE**

### ✅ Verificación

Tu configuración debe verse así:
```
✅ Google provider: ENABLED
✅ Client ID: [tu-client-id].apps.googleusercontent.com
✅ Client Secret: [configurado]
✅ Callback URL: https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback
```

---

## 2️⃣ Microsoft OAuth Setup (Azure AD)

### Paso 1: Crear Azure AD App Registration

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca **Azure Active Directory** (o **Microsoft Entra ID**)
3. En el menú izquierdo: **App registrations**
4. Click **+ New registration**

### Paso 2: Registrar la App

1. **Name**: "quienteto-oauth"
2. **Supported account types**:
   - Selecciona: **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts**
3. **Redirect URI**:
   - Type: **Web**
   - URL: `https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback`
4. Click **Register**

### Paso 3: Copiar Application ID

1. Una vez creada, verás la página **Overview**
2. **COPIA** el **Application (client) ID** - lo necesitarás en Supabase

### Paso 4: Crear Client Secret

1. En el menú izquierdo, click **Certificates & secrets**
2. Tab **Client secrets**
3. Click **+ New client secret**
4. **Description**: "quienteto-prod"
5. **Expires**: 24 months (o lo que prefieras)
6. Click **Add**
7. **COPIA INMEDIATAMENTE** el **Value** (solo se muestra una vez!)

### Paso 5: Configurar en Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard/project/ovduwudtkogevkaqulbo/auth/providers)
2. Busca **Azure** en la lista de providers
3. Click para expandir
4. **Enable Sign in with Azure**: Toggle ON ✅
5. Pega tus credenciales:
   - **Application (Client) ID**: Pega el Application ID de Azure
   - **Secret Value**: Pega el Client Secret de Azure
6. **Azure Tenant URL**:
   - Para cuentas personales y work/school: `https://login.microsoftonline.com/common`
7. Click **SAVE**

### ✅ Verificación

Tu configuración debe verse así:
```
✅ Azure provider: ENABLED
✅ Application ID: [tu-app-id]
✅ Secret Value: [configurado]
✅ Callback URL: https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback
```

---

## 3️⃣ Testing Local (Localhost)

### Importante: Redirect URLs para Development

Si quieres testear en `http://localhost:5173`, necesitas agregar **otra redirect URI** en ambos providers:

**En Google Cloud Console:**
- Authorized redirect URIs: Agrega `http://localhost:54321/auth/v1/callback`

**En Azure App Registration:**
- Add platform → Web → Redirect URI: `http://localhost:54321/auth/v1/callback`

**Nota**: Supabase local usa el puerto `54321` por defecto, NO `5173`

---

## 4️⃣ Verificar que Funciona

### Test Rápido en Supabase Dashboard

1. Ve a: **Authentication → Users**
2. Click **Invite user** (botón verde)
3. En el modal, deberías ver botones para:
   - Continue with Google
   - Continue with Microsoft
4. Click en uno para probar el flujo OAuth

### Test en tu App

1. En tu app local o producción, intenta hacer login
2. Deberías ser redirigido al login de Google/Microsoft
3. Después de aprobar, deberías volver a tu app
4. El usuario debe aparecer en: **Supabase → Authentication → Users**

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa**: La redirect URI no coincide exactamente

**Solución**:
- Verifica que usaste: `https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback`
- NO uses: `https://www.quienteto.ca/auth/callback` (esto es tu app, no Supabase)
- Asegúrate de guardar los cambios en Google Cloud / Azure

### Error: "invalid_client"

**Causa**: Client ID o Client Secret incorrectos

**Solución**:
- Vuelve a copiar las credenciales de Google Cloud / Azure
- Asegúrate de no tener espacios extras al pegar

### Error: "access_denied"

**Causa**: Usuario no tiene permisos / app no aprobada

**Solución Google**:
- Si tu app está en "Testing" mode, solo usuarios en la "Test users" list pueden loguearse
- Considera publicar tu app (Google OAuth consent screen)

**Solución Azure**:
- Verifica que seleccionaste "Multitenant + personal accounts"

---

## 📝 Notas Importantes

1. **Callback URL es de Supabase, NO de tu app**:
   - ✅ Correcto: `https://ovduwudtkogevkaqulbo.supabase.co/auth/v1/callback`
   - ❌ Incorrecto: `https://www.quienteto.ca/auth/callback`

2. **Tu app's callback** (`/auth/callback`) es manejado por AuthProvider:
   - Supabase redirige a Google/Microsoft → Usuario aprueba → Supabase procesa → Tu app recibe session

3. **Email scope**: Ambos providers devuelven email por defecto, no necesitas configurar scopes extra

4. **Producción**: Si cambias de proyecto Supabase, debes actualizar las redirect URIs en Google Cloud / Azure

---

**Última actualización**: Nov 20, 2025
**Supabase Project**: ovduwudtkogevkaqulbo (South America - São Paulo)
