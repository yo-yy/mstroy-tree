import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { ModuleRegistry } from 'ag-grid-community'; 
import { AllEnterpriseModule } from 'ag-grid-enterprise';

// Register all Community and Enterprise features
ModuleRegistry.registerModules([AllEnterpriseModule]);

createApp(App).mount('#app')
