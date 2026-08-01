// app.ts
import './cloud/mocks' // 云端 mock 数据注册（Story 27/29/31/33 云端实现后移除）
import { login } from './cloud/api'
import { syncRecipes } from './services/recipe-sync'

App<IAppOption>({
  globalData: {
    // 身份状态（Story 6）：login() 后填充
    identity: null,
  },
  onLaunch() {
    // 静默登录（云端未实现时为 mock 模式；失败不影响本地功能，Story 22 降级）
    login().catch(() => {
      // ignore
    })
    // 公共菜谱增量同步（Story 32；失败回退内置种子，不阻断）
    syncRecipes().catch(() => {
      // ignore
    })
  },
})
