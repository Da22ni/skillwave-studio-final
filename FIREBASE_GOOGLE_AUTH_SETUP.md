# 🔥 GUÍA FIREBASE: CONFIGURACIÓN GOOGLE AUTHENTICATION

## ❌ PROBLEMA ACTUAL
El login con Google no funciona porque el dominio de deployment no está autorizado en Firebase Console.

**Error típico:** `Firebase: Error (auth/unauthorized-domain)`  
**Causa:** Firebase rechaza dominios no autorizados por seguridad.

---

## 🛠️ SOLUCIÓN PASO A PASO

### 1️⃣ OBTENER EL DOMINIO ACTUAL
**Dominio actual de Skillwave Studio:**
```
https://991d3252-d634-455f-b162-bf15ff2d3510.preview.emergentagent.com
```

**⚠️ IMPORTANTE:** Este dominio cambia según el entorno:
- **Development local:** `localhost:3000`
- **Netlify:** `your-app-name.netlify.app`
- **Vercel:** `your-app-name.vercel.app`
- **Custom domain:** `tu-dominio.com`

### 2️⃣ ACCEDER A FIREBASE CONSOLE
1. Ve a: https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto: **"skillwave-studio"**

### 3️⃣ NAVEGAR A AUTHENTICATION
```
📍 Ruta exacta:
Firebase Console → Tu Proyecto → Authentication → Settings → Authorized domains
```

**Pasos detallados:**
1. En el sidebar izquierdo, click en "Authentication" 🔐
2. En la parte superior, click en la pestaña "Settings" ⚙️
3. Scroll down hasta la sección "Authorized domains" 🌐

### 4️⃣ AGREGAR DOMINIO AUTORIZADO
En la sección "Authorized domains":

1. **Click en "Add domain"** (botón azul)
2. **Pegar exactamente:**
   ```
   255ee2f1-bb5c-45f0-913f-dd41184a9a41.preview.emergentagent.com
   ```
3. **Click "Done"** para guardar

**📷 Aspecto visual:**
```
┌─ Authorized domains ──────────────────────┐
│ localhost                     [Remove]    │
│ skillwave-studio.web.app      [Remove]    │
│ skillwave-studio.firebaseapp.com [Remove]│
│ + Add domain                              │
└───────────────────────────────────────────┘
```

**Después de agregar:**
```
┌─ Authorized domains ──────────────────────┐
│ localhost                     [Remove]    │
│ skillwave-studio.web.app      [Remove]    │
│ skillwave-studio.firebaseapp.com [Remove]│
│ 255ee2f1-bb5c-45f0-913f-dd41...  [Remove]│
└───────────────────────────────────────────┘
```

---

## 🔄 CONFIGURACIÓN POR ENTORNO

### 🏠 DESARROLLO LOCAL
```bash
# Dominio para development
localhost:3000
```

### 🚀 NETLIFY DEPLOYMENT
```bash
# Formato típico Netlify
your-app-name.netlify.app
# O dominio custom
your-custom-domain.com
```

### ⚡ VERCEL DEPLOYMENT  
```bash
# Formato típico Vercel
your-app-name.vercel.app
# O dominio custom
your-custom-domain.com
```

### 🏢 PRODUCCIÓN
```bash
# Tu dominio final
skillwavestudio.com
www.skillwavestudio.com
```

---

## 🎯 VERIFICACIÓN DE CONFIGURACIÓN

### ✅ CÓMO CONFIRMAR QUE FUNCIONA
1. Guarda los cambios en Firebase Console
2. Espera 1-2 minutos (propagación)
3. Refresh la página de Skillwave Studio
4. Click en "Sign in with Google"
5. **✅ ÉXITO:** Aparece popup de Google OAuth
6. **❌ ERROR:** Sigue apareciendo error de dominio

### 🔍 TROUBLESHOOTING
**Si sigue sin funcionar:**
1. ✓ Verifica que el dominio esté **exactamente igual** (sin https://)
2. ✓ Confirma que no hay espacios extra
3. ✓ Espera 5 minutos más (cache de Firebase)
4. ✓ Hard refresh del navegador (Ctrl+F5)

**Comando para verificar el dominio actual:**
```javascript
// Ejecutar en DevTools Console
console.log(window.location.hostname);
```

---

## 📋 CHECKLIST COMPLETO

### 🎯 ANTES DE DEPLOYMENT
- [ ] Obtener URL final de deployment
- [ ] Agregar dominio a Firebase Console
- [ ] Verificar que otros dominios estén listados (localhost, etc.)
- [ ] Guardar cambios y esperar propagación

### 🎯 DESPUÉS DE DEPLOYMENT  
- [ ] Probar Google Auth en el nuevo dominio
- [ ] Verificar que persista después de login
- [ ] Confirmar que funciona en modo incógnito
- [ ] Documentar el nuevo dominio para futuros deployments

---

## 🚨 DOMINIOS MÚLTIPLES

**Para diferentes entornos, agrega TODOS:**
```
✅ localhost (desarrollo)
✅ tu-app.netlify.app (staging)
✅ tu-dominio.com (producción)  
✅ 255ee2f1-bb5c-45f0-913f-dd41184a9a41.preview.emergentagent.com (actual)
```

**🔒 SEGURIDAD:** Solo agrega dominios que controles. Firebase rechaza solicitudes de dominios no autorizados.

---

## ⚡ REFERENCIAS ÚTILES

**Firebase Documentation:**
- [Authenticate with Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Authorized Domains](https://firebase.google.com/docs/auth/web/auth-domain)

**Archivo de configuración en Skillwave:**
- `/app/frontend/src/services/firebase.js` (configuración)
- `/app/frontend/src/hooks/useAuth.js` (lógica de login)

---

*Última actualización: Configuración actual para deployment preview de Emergent*