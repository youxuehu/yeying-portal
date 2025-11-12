import '@/assets/style.css'
import { t } from '@yeying-community/yeying-i18n'
import '@yeying-community/yeying-wallet/dist/yeying-wallet.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { routes } from '@/router'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createWallet, sdkRoutes } from '@yeying-community/yeying-wallet'
import { initializeProviders } from '@/plugins/account'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { notifyError, notifySuccess } from './utils/message'
import { getWalletDataStore } from '@/stores/auth'
import { waitForWallet } from '@yeying-community/yeying-web3'

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus, {
    locale: zhCn
})

app.config.globalProperties.$t = t

// 合并路由
const router: Router = createRouter({
    history: createWebHistory(),
    routes: [...routes, ...sdkRoutes]
})

app.use(router)
// 页面加载时检测钱包
window.addEventListener('load', async () => {
  try {
    await waitForWallet();
    getWalletDataStore().setWalletReady(true)
  } catch (error) {
    console.error('钱包检测失败:', error);
    const innerHTML = `
        <p>❌ 未检测到钱包</p>
        <p class="error">请确保：</p>
        <ul>
        <li>•已安装 YeYing Wallet 扩展</li>
        <li>•已启用扩展</li>
        <li>•已在扩展设置中允许访问文件 URL（如果使用 file:// 协议）</li>
        <li>•刷新页面后重试</li>
        </ul>
    `;
    notifyError(innerHTML)
  }
});
initializeProviders()
  .then(() => {
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Failed to initialize providers:', error)
    // 可以显示错误页面或提示
    app.mount('#app') // 即使失败也挂载，避免白屏
  })