import { electronApi } from '../utils/electronApi'

export const electronActivityService = {
  onActivityStatusChanged(callback: (data: any) => void): () => void {
    if (!electronApi?.onActivityStatusChanged) {
      return () => undefined
    }

    return electronApi.onActivityStatusChanged(callback)
  }
}
