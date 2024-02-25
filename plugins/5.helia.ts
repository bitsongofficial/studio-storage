import { UnixFS, unixfs } from "@helia/unixfs";
import { LevelBlockstore } from "blockstore-level";
import { LevelDatastore } from "datastore-level";
import { createHelia } from "helia";

declare module 'h3' {
  interface H3EventContext {
    fs: UnixFS
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[helia] plugin loading...')

  const helia = await createHelia({
    blockstore: new LevelBlockstore('./.helia/blockstore'),
    datastore: new LevelDatastore('./.helia/datastore')
  })

  const fs = unixfs(helia)

  nitroApp.hooks.hook('request', async (event) => {
    console.log('[helia] plugin request...')

    event.node.req.setMaxListeners(100)
    event.context.fs = fs
  })

  nitroApp.hooks.hook('close', async () => {
    console.log('[helia] plugin close...')
    await helia.stop()
  })

  console.log('[helia] plugin loaded')
})