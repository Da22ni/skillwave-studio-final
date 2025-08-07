# 🎨 **SKILLWAVE STUDIO - VISUAL WEBSITE BUILDER MVP**

## **✨ ¿Qué es Skillwave Studio?**

Skillwave Studio es una plataforma educativa de diseño visual que permite crear sitios web de manera intuitiva, similar a Webflow, pero con **asistencia de IA educativa** que explica cada acción que realizas.

### **🎯 Características Principales**

- **🎨 Editor Visual**: Drag & drop para crear sitios web sin código
- **💻 Vista de Código en Tiempo Real**: Ve el HTML/CSS generado instantáneamente  
- **🤖 IA Educativa**: Explicaciones inteligentes sobre lo que estás haciendo
- **📱 Diseño Responsivo**: Vista Desktop, Tablet y Mobile
- **🔐 Autenticación Google**: Login seguro con Firebase
- **📦 Exportación ZIP**: Descarga tu proyecto completo
- **🌐 Multiidioma**: Inglés y Español
- **🎮 Modo Demo**: Prueba sin registrarte

---

## **🚀 Cómo Ejecutar el Proyecto**

### **1. Instalación de Dependencias**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

### **2. Configuración de Variables de Entorno**

**Frontend (.env):**
```bash
# Firebase (reemplaza con tus claves reales)
REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id

# OpenAI (opcional para IA educativa)
REACT_APP_OPENAI_API_KEY=sk-tu-clave-openai

# Backend URL (ya configurado)
REACT_APP_BACKEND_URL=https://tu-backend-url.com
```

### **3. Ejecución**
```bash
# Ejecutar backend y frontend simultáneamente
sudo supervisorctl restart all

# O manualmente:
cd backend && python -m uvicorn server:app --host 0.0.0.0 --port 8001 &
cd frontend && yarn start
```

---

## **📂 Estructura del Proyecto**

```
skillwave-studio/
├── frontend/                   # React App
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Auth/         # Sistema de autenticación
│   │   │   ├── Dashboard/    # Gestión de proyectos
│   │   │   ├── Editor/       # Editor visual
│   │   │   ├── CodePreview/  # Vista de código
│   │   │   ├── IA/           # Asistente IA y Logger
│   │   │   ├── Exporter/     # Exportación ZIP
│   │   │   └── UI/           # Componentes base
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # APIs (Firebase, OpenAI)
│   │   ├── store/            # Estado global (Zustand)
│   │   └── i18n/             # Internacionalización
│   └── package.json
├── backend/                   # FastAPI Server
│   ├── server.py             # Servidor principal
│   └── requirements.txt
└── README.md
```

---

## **🎮 Cómo Usar la Aplicación**

### **1. Inicio de Sesión**
- **Opción 1**: "Sign in with Google" (requiere Firebase configurado)
- **Opción 2**: "Try Demo Mode" (funciona inmediatamente)

### **2. Dashboard**
- Ve tus proyectos guardados
- Crea un nuevo proyecto
- Abre proyectos existentes para editarlos

### **3. Editor Visual**
- **Canvas**: Área de diseño donde arrastras elementos
- **Element Panel**: Elementos disponibles (Text, Button, Image)
- **Properties Panel**: Edita propiedades del elemento seleccionado
- **Code Panel**: Ve el HTML/CSS generado en tiempo real

### **4. Modos de Vista**
- **Canvas**: Solo editor visual
- **Code**: Solo código generado  
- **Both**: Editor + código simultáneamente

### **5. Responsive Design**
- **Desktop**: Vista escritorio (1200px)
- **Tablet**: Vista tablet (768px)  
- **Mobile**: Vista móvil (375px)

### **6. IA Educativa**
- **Logger Panel**: Registra todas tus acciones
- **AI Assistant**: Explica lo que estás haciendo
- Haz preguntas como "¿Cómo cambio colores?" o "¿Qué es CSS?"

### **7. Exportación**
- Botón "Export" genera un ZIP con:
  - `index.html` - Tu página web completa
  - `styles.css` - Todos los estilos CSS
  - `README.md` - Instrucciones de uso

---

**Made with ❤️ by Skillwave Studio Team**

*Esta es la base real de una plataforma educativa global que escalará a un GitHub + LinkedIn + Webflow para desarrolladores.*
