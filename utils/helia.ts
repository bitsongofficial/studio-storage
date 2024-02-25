import { createHelia, HeliaLibp2p } from "helia"
import { unixfs, UnixFS } from '@helia/unixfs'
import { LevelBlockstore } from 'blockstore-level'
import { LevelDatastore } from 'datastore-level'

let helia: HeliaLibp2p
let fs: UnixFS

export async function getHelia() {
    console.log('[helia] plugin loading...')

    if (!helia) {
        helia = await createHelia({
            blockstore: new LevelBlockstore('./blockstore'),
            datastore: new LevelDatastore('./datastore')
        })
    }

    if (!fs) {
        fs = unixfs(helia)
    }

    //event.node.req.setMaxListeners(100)
    
    console.log('[helia] plugin loaded')

    return {
        helia,
        fs
    }
}